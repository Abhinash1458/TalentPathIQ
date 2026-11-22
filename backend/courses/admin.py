from django.contrib import admin

from .models import (
    Assignment,
    AssignmentSubmission,
    Course,
    CourseQuiz,
    Enrolment,
    QuizAttempt,
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "level", "duration", "created_at")
    list_filter = ("category", "level")
    search_fields = ("title", "description")


@admin.register(Enrolment)
class EnrolmentAdmin(admin.ModelAdmin):
    list_display = ("student_id", "course", "status", "progress_percent", "enrolled_at")
    list_filter = ("status", "course")
    search_fields = ("student_id", "course__title")
    autocomplete_fields = ("course",)
    readonly_fields = ("enrolled_at",)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """Create each assignment under the course it belongs to."""

    list_display = ("title", "course", "due_at", "is_active", "sort_order")
    list_filter = ("course", "is_active")
    search_fields = ("title", "description", "course__title")
    autocomplete_fields = ("course",)
    list_editable = ("is_active", "sort_order")
    ordering = ("course__title", "sort_order", "id")
    fieldsets = (
        ("Course and assignment", {"fields": ("course", "title", "description")}),
        ("Submission rules", {"fields": ("due_at", "allowed_types", "max_size_mb")}),
        ("Display", {"fields": ("sort_order", "is_active")}),
    )


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "course_name", "student_id", "submitted_at", "status", "score")
    list_filter = ("status", "assignment__course")
    search_fields = ("assignment__title", "assignment__course__title", "student_id")
    autocomplete_fields = ("assignment",)
    readonly_fields = ("student_id", "file", "submitted_at")
    fields = ("assignment", "student_id", "file", "submitted_at", "status", "score", "feedback")

    @admin.display(description="Course", ordering="assignment__course__title")
    def course_name(self, obj):
        return obj.assignment.course.title


@admin.register(CourseQuiz)
class CourseQuizAdmin(admin.ModelAdmin):
    """Create each quiz under the course it belongs to."""

    list_display = (
        "title", "course", "question_count", "time_limit_minutes",
        "pass_mark", "attempts_allowed", "is_active", "sort_order",
    )
    list_filter = ("course", "is_active")
    search_fields = ("title", "course__title")
    autocomplete_fields = ("course",)
    list_editable = ("is_active", "sort_order")
    ordering = ("course__title", "sort_order", "id")
    fieldsets = (
        ("Course and quiz", {"fields": ("course", "title")}),
        ("Quiz settings", {
            "fields": (
                "question_count", "time_limit_minutes", "pass_mark",
                "attempts_allowed", "locked_until_module",
            )
        }),
        ("Display", {"fields": ("sort_order", "is_active")}),
    )


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("quiz", "course_name", "student_id", "score", "completed_at")
    list_filter = ("quiz__course", "quiz")
    search_fields = ("quiz__title", "quiz__course__title", "student_id")
    autocomplete_fields = ("quiz",)
    readonly_fields = ("quiz", "student_id", "score", "completed_at")

    @admin.display(description="Course", ordering="quiz__course__title")
    def course_name(self, obj):
        return obj.quiz.course.title
