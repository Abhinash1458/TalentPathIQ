from django.conf import settings
from django.db import IntegrityError, transaction
from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
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
