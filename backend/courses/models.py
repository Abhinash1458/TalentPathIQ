from django.db import models
class Course(models.Model):

    CATEGORY_CHOICES = [
        ('Frontend', 'Frontend'),
        ('Backend', 'Backend'),
        ('Database', 'Database'),
        ('AI/ML', 'AI/ML'),
        ('Programming', 'Programming'),
    ]

    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    level = models.CharField(
        max_length=50,
        choices=LEVEL_CHOICES
    )

    description = models.TextField()

    duration = models.CharField(
    max_length=100,
    blank=True,
    default=""
)

    image = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']



class Enrolment(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not started"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    # Railway already stores this column as VARCHAR; keep it as text to match the existing schema.
    student_id = models.CharField(max_length=36)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrolments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
    progress_percent = models.PositiveSmallIntegerField(default=0)
    last_lesson_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "courses_enrolment"
        constraints = [
            models.UniqueConstraint(fields=["student_id", "course"], name="unique_student_course_enrolment")
        ]

    def __str__(self):
        return f"{self.student_id} - {self.course.title}"
