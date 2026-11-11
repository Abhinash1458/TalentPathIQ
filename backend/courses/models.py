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

