
from django.db import models


def default_assignment_file_types():
    return ["pdf", "docx", "zip"]


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

    # Railway already stores this column as VARCHAR.
    # Keep it as text to match the existing schema.
    student_id = models.CharField(max_length=36)

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrolments"
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="not_started"
    )

    progress_percent = models.PositiveSmallIntegerField(default=0)

    last_lesson_id = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    completed_lesson_ids = models.JSONField(
        default=list,
        blank=True
    )

    last_accessed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = "courses_enrolment"
        constraints = [
            models.UniqueConstraint(
                fields=["student_id", "course"],
                name="unique_student_course_enrolment"
            )
        ]

    def __str__(self):
        return f"{self.student_id} - {self.course.title}"


class Assignment(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    title = models.CharField(max_length=240)

    description = models.TextField(
        blank=True,
        default=""
    )

    due_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # All assignments accept PDF, DOCX and ZIP files.
    allowed_types = models.JSONField(
        default=default_assignment_file_types,
        blank=True
    )

    # Maximum upload size: 50 MB.
    max_size_mb = models.PositiveSmallIntegerField(default=50)

    sort_order = models.PositiveSmallIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):

    STATUS_CHOICES = [
        ("not_submitted", "Not submitted"),
        ("under_review", "Under review"),
        ("graded", "Graded"),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions"
    )

    student_id = models.CharField(max_length=36)

    file = models.FileField(
        upload_to="course-submissions/%Y/%m/"
    )

    submitted_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="under_review"
    )

    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    feedback = models.TextField(
        blank=True,
        default=""
    )

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "student_id"],
                name="unique_assignment_student_submission"
            )
        ]

    def __str__(self):
        return f"{self.assignment.title} - {self.student_id}"


class CourseQuiz(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    title = models.CharField(max_length=240)

    question_count = models.PositiveSmallIntegerField(default=10)

    time_limit_minutes = models.PositiveSmallIntegerField(default=15)

    pass_mark = models.PositiveSmallIntegerField(default=6)

    attempts_allowed = models.PositiveSmallIntegerField(default=2)

    locked_until_module = models.PositiveSmallIntegerField(
        null=True,
        blank=True
    )

    sort_order = models.PositiveSmallIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class QuizAttempt(models.Model):

    quiz = models.ForeignKey(
        CourseQuiz,
        on_delete=models.CASCADE,
        related_name="attempts"
    )

    student_id = models.CharField(max_length=36)

    score = models.PositiveSmallIntegerField()

    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.quiz.title} - {self.score}/{self.quiz.question_count}"
