# TPIQ-57-B/C: database-backed assignments, learner submissions, quizzes and attempts.
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("courses", "0004_student_id_text_state")]

    operations = [
        migrations.CreateModel(
            name="Assignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=240)),
                ("description", models.TextField(blank=True, default="")),
                ("due_at", models.DateTimeField(blank=True, null=True)),
                ("allowed_types", models.JSONField(blank=True, default=list)),
                ("max_size_mb", models.PositiveSmallIntegerField(default=20)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="courses.course")),
            ],
            options={"ordering": ["sort_order", "id"]},
        ),
        migrations.CreateModel(
            name="CourseQuiz",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=240)),
                ("question_count", models.PositiveSmallIntegerField(default=10)),
                ("time_limit_minutes", models.PositiveSmallIntegerField(default=15)),
                ("pass_mark", models.PositiveSmallIntegerField(default=6)),
                ("attempts_allowed", models.PositiveSmallIntegerField(default=2)),
                ("locked_until_module", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="quizzes", to="courses.course")),
            ],
            options={"ordering": ["sort_order", "id"]},
        ),
        migrations.CreateModel(
            name="AssignmentSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("student_id", models.CharField(max_length=36)),
                ("file", models.FileField(upload_to="course-submissions/%Y/%m/")),
                ("submitted_at", models.DateTimeField(auto_now=True)),
                ("status", models.CharField(choices=[("not_submitted", "Not submitted"), ("under_review", "Under review"), ("graded", "Graded")], default="under_review", max_length=20)),
                ("score", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("feedback", models.TextField(blank=True, default="")),
                ("assignment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="submissions", to="courses.assignment")),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.AddConstraint(
            model_name="assignmentsubmission",
            constraint=models.UniqueConstraint(fields=("assignment", "student_id"), name="unique_assignment_student_submission"),
        ),
        migrations.CreateModel(
            name="QuizAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("student_id", models.CharField(max_length=36)),
                ("score", models.PositiveSmallIntegerField()),
                ("completed_at", models.DateTimeField(auto_now_add=True)),
                ("quiz", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="courses.coursequiz")),
            ],
            options={"ordering": ["-completed_at"]},
        ),
    ]
