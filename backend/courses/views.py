from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from rest_framework import filters, serializers, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin

from .models import Course, Enrolment
from .serializers import CourseSerializer, EnrolmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "category", "description"]
    ordering_fields = ["title", "created_at"]


class EnrolmentViewSet(ListModelMixin, GenericViewSet):
    """Unauthenticated TPIQ-54 demo enrolments for the configured demo student."""

    serializer_class = EnrolmentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Do not trust a student ID supplied by the browser in demo mode.
        return Enrolment.objects.filter(
            student_id=settings.DEMO_STUDENT_ID
        ).select_related("course")


    @action(detail=False, methods=["patch"], url_path="progress")
    def progress(self, request):
        course_id = request.data.get("courseId")
        lesson_id = request.data.get("lessonId")
        completed_ids = request.data.get("completedLessonIds", [])
        if not course_id:
            return Response({"detail": "courseId is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            enrolment = self.get_queryset().get(course_id=course_id)
        except Enrolment.DoesNotExist:
            return Response({"detail": "Enrolment not found."}, status=status.HTTP_404_NOT_FOUND)
        if not isinstance(completed_ids, list):
            return Response({"detail": "completedLessonIds must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        # The current TPIQ-57 demo workspace contains nine lessons.
        total_lessons = 9
        completed_ids = list(dict.fromkeys(str(item) for item in completed_ids))
        completed_count = min(len(completed_ids), total_lessons)
        enrolment.completed_lesson_ids = completed_ids
        enrolment.progress_percent = round((completed_count / total_lessons) * 100)
        enrolment.last_lesson_id = str(lesson_id) if lesson_id else enrolment.last_lesson_id
        enrolment.last_accessed_at = timezone.now()
        enrolment.status = "completed" if completed_count >= total_lessons else ("in_progress" if completed_count or lesson_id else "not_started")
        enrolment.completed_at = timezone.now() if enrolment.status == "completed" else None
        enrolment.save(update_fields=["completed_lesson_ids", "progress_percent", "last_lesson_id", "last_accessed_at", "status", "completed_at"])
        return Response(EnrolmentSerializer(enrolment).data)

    def create(self, request, *args, **kwargs):
        course_id = request.data.get("courseId")
        if course_id in (None, ""):
            return Response(
                {"detail": "courseId is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                enrolment, created = Enrolment.objects.get_or_create(
                    student_id=settings.DEMO_STUDENT_ID,
                    course_id=course_id,
                    defaults={"status": "not_started", "progress_percent": 0},
                )
        except IntegrityError:
            # Covers concurrent double-clicks/API retries protected by the DB constraint.
            existing = Enrolment.objects.filter(
                student_id=settings.DEMO_STUDENT_ID, course_id=course_id
            ).first()
            if existing:
                return Response(
                    EnrolmentSerializer(existing).data,
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                {"detail": "The requested course does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (ValueError, TypeError):
            return Response(
                {"detail": "courseId must be a valid course ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not created:
            return Response(
                EnrolmentSerializer(enrolment).data,
                status=status.HTTP_409_CONFLICT,
            )
        return Response(
            EnrolmentSerializer(enrolment).data,
            status=status.HTTP_201_CREATED,
        )


from rest_framework.parsers import MultiPartParser, FormParser
from .models import Assignment, AssignmentSubmission, CourseQuiz
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer, CourseQuizSerializer


class AssignmentViewSet(ListModelMixin, GenericViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Assignment.objects.filter(is_active=True).select_related("course").prefetch_related("submissions")
        course_id = self.request.query_params.get("courseId")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student_id"] = settings.DEMO_STUDENT_ID
        return context


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_queryset(self):
        queryset = AssignmentSubmission.objects.filter(
            student_id=settings.DEMO_STUDENT_ID
        ).select_related("assignment")
        assignment_id = self.request.query_params.get("assignmentId")
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        return queryset

    def create(self, request, *args, **kwargs):
        assignment_id = request.data.get("assignmentId")
        uploaded_file = request.FILES.get("file")
        if not assignment_id or not uploaded_file:
            return Response({"detail": "assignmentId and file are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            assignment = Assignment.objects.get(pk=assignment_id, is_active=True)
        except Assignment.DoesNotExist:
            return Response({"detail": "Assignment not found."}, status=status.HTTP_404_NOT_FOUND)

        extension = uploaded_file.name.rsplit(".", 1)[-1].lower() if "." in uploaded_file.name else ""
        allowed = [item.lower() for item in assignment.allowed_types]
        if extension not in allowed:
            return Response({"detail": f"Allowed file types: {', '.join(allowed)}."}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded_file.size > assignment.max_size_mb * 1024 * 1024:
            return Response({"detail": f"File must be {assignment.max_size_mb} MB or smaller."}, status=status.HTTP_400_BAD_REQUEST)

        record, created = AssignmentSubmission.objects.update_or_create(
            assignment=assignment,
            student_id=settings.DEMO_STUDENT_ID,
            defaults={"file": uploaded_file, "status": "under_review", "score": None, "feedback": ""},
        )
        serializer = self.get_serializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CourseQuizViewSet(ListModelMixin, GenericViewSet):
    serializer_class = CourseQuizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = CourseQuiz.objects.filter(is_active=True).prefetch_related("attempts")
        course_id = self.request.query_params.get("courseId")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student_id"] = settings.DEMO_STUDENT_ID
        return context


class QuizAttemptViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.ModelSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        from .models import QuizAttempt
        quiz_id = request.data.get("quizId")
        score = request.data.get("score")
        try:
            quiz = CourseQuiz.objects.get(pk=quiz_id, is_active=True)
            score_value = int(score)
        except (CourseQuiz.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "A valid quizId and score are required."}, status=status.HTTP_400_BAD_REQUEST)
        if score_value < 0 or score_value > quiz.question_count:
            return Response({"detail": f"score must be between 0 and {quiz.question_count}."}, status=status.HTTP_400_BAD_REQUEST)
        used = QuizAttempt.objects.filter(quiz=quiz, student_id=settings.DEMO_STUDENT_ID).count()
        if used >= quiz.attempts_allowed:
            return Response({"detail": "No attempts remaining."}, status=status.HTTP_409_CONFLICT)
        attempt = QuizAttempt.objects.create(quiz=quiz, student_id=settings.DEMO_STUDENT_ID, score=score_value)
        return Response({
            "id": attempt.id,
            "quizId": quiz.id,
            "score": attempt.score,
            "attemptsUsed": used + 1,
            "bestScore": max(score_value, QuizAttempt.objects.filter(quiz=quiz, student_id=settings.DEMO_STUDENT_ID).exclude(pk=attempt.pk).order_by("-score").values_list("score", flat=True).first() or 0),
            "completedAt": attempt.completed_at,
        }, status=status.HTTP_201_CREATED)
