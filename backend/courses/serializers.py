from rest_framework import serializers
from .models import Course, Enrolment


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class EnrolmentSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source="student_id", read_only=True)
    courseId = serializers.IntegerField(source="course_id", read_only=True)
    enrolledAt = serializers.DateTimeField(source="enrolled_at", read_only=True)
    progressPercent = serializers.IntegerField(source="progress_percent", read_only=True)
    lastLessonId = serializers.CharField(source="last_lesson_id", read_only=True, allow_null=True)
    lastAccessedAt = serializers.DateTimeField(source="last_accessed_at", read_only=True, allow_null=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True, allow_null=True)
    completedLessonIds = serializers.ListField(source="completed_lesson_ids", child=serializers.CharField(), read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrolment
        fields = [
            "id", "studentId", "courseId", "enrolledAt", "status",
            "progressPercent", "lastLessonId", "lastAccessedAt", "completedAt", "completedLessonIds", "course",
        ]


from .models import Assignment, AssignmentSubmission, CourseQuiz, QuizAttempt


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    fileName = serializers.SerializerMethodField()
    fileSize = serializers.SerializerMethodField()
    submittedDate = serializers.DateTimeField(source="submitted_at", read_only=True)
    class Meta:
        model = AssignmentSubmission
        fields = ["id", "status", "file", "fileName", "fileSize", "submittedDate", "score", "feedback"]
        read_only_fields = ["id", "status", "submittedDate", "score", "feedback"]

    def get_fileName(self, obj):
        return obj.file.name.rsplit("/", 1)[-1] if obj.file else ""

    def get_fileSize(self, obj):
        try:
            return obj.file.size
        except (OSError, ValueError):
            return 0


class AssignmentSerializer(serializers.ModelSerializer):
    dueAt = serializers.DateTimeField(source="due_at", read_only=True)
    allowedTypes = serializers.ListField(source="allowed_types", child=serializers.CharField(), read_only=True)
    maxSizeMB = serializers.IntegerField(source="max_size_mb", read_only=True)
    submission = serializers.SerializerMethodField()
    class Meta:
        model = Assignment
        fields = ["id", "title", "description", "dueAt", "allowedTypes", "maxSizeMB", "submission"]

    def get_submission(self, obj):
        student_id = self.context.get("student_id")
        record = (
            obj.submissions
            .filter(student_id=student_id)
            .exclude(file="")
            .first()
        )
        return AssignmentSubmissionSerializer(record, context=self.context).data if record else None


class CourseQuizSerializer(serializers.ModelSerializer):
    questions = serializers.IntegerField(source="question_count", read_only=True)
    timeLimit = serializers.IntegerField(source="time_limit_minutes", read_only=True)
    passMark = serializers.IntegerField(source="pass_mark", read_only=True)
    attemptsAllowed = serializers.IntegerField(source="attempts_allowed", read_only=True)
    lockedUntilModule = serializers.IntegerField(source="locked_until_module", read_only=True, allow_null=True)
    attemptsUsed = serializers.SerializerMethodField()
    bestScore = serializers.SerializerMethodField()
    class Meta:
        model = CourseQuiz
        fields = ["id", "title", "questions", "timeLimit", "passMark", "attemptsAllowed", "lockedUntilModule", "attemptsUsed", "bestScore"]

    def _attempts(self, obj):
        return obj.attempts.filter(student_id=self.context.get("student_id"))

    def get_attemptsUsed(self, obj):
        return self._attempts(obj).count()

    def get_bestScore(self, obj):
        from django.db.models import Max
        return self._attempts(obj).aggregate(value=Max("score"))["value"]
