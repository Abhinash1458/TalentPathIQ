from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course


def make_course(**overrides):
    """Create a Course, overriding any of the defaults."""
    fields = {
        "title": "Django Development",
        "category": "Backend",
        "level": "Intermediate",
        "description": "Build web applications using the Django framework.",
    }
    fields.update(overrides)
    return Course.objects.create(**fields)


class CourseModelTests(APITestCase):
    def test_str_is_the_title(self):
        course = make_course(title="Advanced SQL")
        self.assertEqual(str(course), "Advanced SQL")

    def test_duration_defaults_to_empty_string(self):
        """Blank rather than NULL, so templates never render "None"."""
        course = make_course()
        self.assertEqual(course.duration, "")

    def test_image_defaults_to_none(self):
        course = make_course()
        self.assertIsNone(course.image)

    def test_default_ordering_is_newest_first(self):
        first = make_course(title="First")
        second = make_course(title="Second")

        # created_at is auto_now_add, so it cannot be set on create and the
        # two rows can land on the same timestamp. Separate them explicitly
        # to keep the assertion deterministic.
        Course.objects.filter(pk=first.pk).update(
            created_at="2020-01-01T00:00:00+00:00"
        )
        Course.objects.filter(pk=second.pk).update(
            created_at="2030-01-01T00:00:00+00:00"
        )

        self.assertEqual(
            list(Course.objects.values_list("title", flat=True)),
            ["Second", "First"],
        )


class CourseListAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("course-list")

    def test_empty_catalogue_returns_empty_list(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_lists_every_course(self):
        make_course(title="One")
        make_course(title="Two")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_serializes_the_expected_fields(self):
        make_course()

        payload = self.client.get(self.url).data[0]

        self.assertEqual(
            set(payload),
            {
                "id",
                "title",
                "category",
                "level",
                "description",
                "duration",
                "image",
                "created_at",
                "updated_at",
            },
        )


class CourseSearchTests(APITestCase):
    def setUp(self):
        self.url = reverse("course-list")
        make_course(
            title="React JS Development",
            category="Frontend",
            description="Build interactive user interfaces using React.",
            level="Intermediate",
        )
        make_course(
            title="MongoDB Database",
            category="Database",
            description="Learn NoSQL database concepts using MongoDB.",
            level="Advanced",
        )

    def search(self, term):
        return [c["title"] for c in self.client.get(self.url, {"search": term}).data]

    def test_matches_on_title(self):
        self.assertEqual(self.search("React"), ["React JS Development"])

    def test_matches_on_category(self):
        self.assertEqual(self.search("Database"), ["MongoDB Database"])

    def test_matches_on_description(self):
        self.assertEqual(self.search("NoSQL"), ["MongoDB Database"])

    def test_is_case_insensitive(self):
        self.assertEqual(self.search("rEaCt"), ["React JS Development"])

    def test_does_not_match_on_level(self):
        """level is absent from search_fields, so filtering by it finds nothing."""
        self.assertEqual(self.search("Advanced"), [])

    def test_unmatched_term_returns_nothing(self):
        self.assertEqual(self.search("COBOL"), [])


class CourseOrderingTests(APITestCase):
    def setUp(self):
        self.url = reverse("course-list")
        make_course(title="Zebra")
        make_course(title="Alpha")

    def test_orders_by_title(self):
        response = self.client.get(self.url, {"ordering": "title"})

        self.assertEqual(
            [c["title"] for c in response.data], ["Alpha", "Zebra"]
        )

    def test_orders_by_title_descending(self):
        response = self.client.get(self.url, {"ordering": "-title"})

        self.assertEqual(
            [c["title"] for c in response.data], ["Zebra", "Alpha"]
        )


class CourseDetailAPITests(APITestCase):
    def test_retrieves_a_single_course(self):
        course = make_course(title="Deep Learning", category="AI/ML")

        response = self.client.get(reverse("course-detail", args=[course.pk]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Deep Learning")
        self.assertEqual(response.data["category"], "AI/ML")

    def test_missing_course_returns_404(self):
        response = self.client.get(reverse("course-detail", args=[9999]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CourseWriteAPITests(APITestCase):
    """
    The viewset is a ModelViewSet with AllowAny, so these endpoints are
    currently open to anonymous writes. These tests pin that behaviour down
    so that adding authentication later is a deliberate, visible change
    rather than a silent one.
    """

    def test_anonymous_user_can_create(self):
        response = self.client.post(
            reverse("course-list"),
            {
                "title": "Prompt Engineering",
                "category": "AI/ML",
                "level": "Intermediate",
                "description": "Learn techniques for writing effective AI prompts.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)

    def test_anonymous_user_can_delete(self):
        course = make_course()

        response = self.client.delete(
            reverse("course-detail", args=[course.pk])
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 0)

    def test_rejects_a_category_outside_the_choices(self):
        response = self.client.post(
            reverse("course-list"),
            {
                "title": "Quantum Computing",
                "category": "Quantum",
                "level": "Advanced",
                "description": "Not one of the allowed categories.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_requires_a_title(self):
        response = self.client.post(
            reverse("course-list"),
            {
                "category": "Backend",
                "level": "Beginner",
                "description": "Missing a title.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)
