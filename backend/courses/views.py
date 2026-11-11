from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny

from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.all()

    serializer_class = CourseSerializer

    permission_classes = [AllowAny]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        'title',
        'category',
        'description',
    ]

    ordering_fields = [
        'title',
        'created_at',
    ]
