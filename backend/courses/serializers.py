from rest_framework import serializers
from .models import Course, Enrolment


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class EnrolmentSerializer(serializers.ModelSerializer):
    studentId = serializers.UUIDField(source="student_id", read_only=True)
    courseId = serializers.IntegerField(source="course_id", read_only=True)
    enrolledAt = serializers.DateTimeField(source="enrolled_at", read_only=True)
    progressPercent = serializers.IntegerField(source="progress_percent", read_only=True)
    lastLessonId = serializers.CharField(source="last_lesson_id", read_only=True, allow_null=True)

    class Meta:
        model = Enrolment
        fields = ["id", "studentId", "courseId", "enrolledAt", "status", "progressPercent", "lastLessonId"]
