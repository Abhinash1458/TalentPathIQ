from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrolmentViewSet, AssignmentViewSet, AssignmentSubmissionViewSet, CourseQuizViewSet, QuizAttemptViewSet

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"enrolments", EnrolmentViewSet, basename="enrolment")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"submissions", AssignmentSubmissionViewSet, basename="submission")
router.register(r"quizzes", CourseQuizViewSet, basename="quiz")
router.register(r"quiz-attempts", QuizAttemptViewSet, basename="quiz-attempt")

urlpatterns = [path("", include(router.urls))]
