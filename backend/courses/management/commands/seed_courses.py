from django.core.management.base import BaseCommand
from courses.models import Course


COURSE_DATA = [
    # FRONTEND - 6
    {
        "title": "HTML Fundamentals",
        "category": "Frontend",
        "level": "Beginner",
        "description": "Learn the fundamentals of HTML and build structured web pages.",
    },
    {
        "title": "CSS Fundamentals",
        "category": "Frontend",
        "level": "Beginner",
        "description": "Learn styling, layouts, selectors and modern CSS.",
    },
    {
        "title": "JavaScript Development",
        "category": "Frontend",
        "level": "Beginner",
        "description": "Understand JavaScript programming and browser interactions.",
    },
    {
        "title": "React JS Development",
        "category": "Frontend",
        "level": "Intermediate",
        "description": "Build interactive user interfaces using React.",
    },
    {
        "title": "Angular Development",
        "category": "Frontend",
        "level": "Intermediate",
        "description": "Develop modern web applications using Angular.",
    },
    {
        "title": "Bootstrap and Responsive Design",
        "category": "Frontend",
        "level": "Beginner",
        "description": "Create responsive websites using Bootstrap.",
    },

    # BACKEND - 6
    {
        "title": "Python Full Stack Development",
        "category": "Backend",
        "level": "Beginner",
        "description": "Learn Python and build full-stack web applications.",
    },
    {
        "title": "Django Development",
        "category": "Backend",
        "level": "Intermediate",
        "description": "Build web applications using the Django framework.",
    },
    {
        "title": "Node.js Development",
        "category": "Backend",
        "level": "Intermediate",
        "description": "Learn server-side JavaScript development.",
    },
    {
        "title": "Express.js Development",
        "category": "Backend",
        "level": "Intermediate",
        "description": "Create backend applications and APIs using Express.",
    },
    {
        "title": "Java Spring Boot",
        "category": "Backend",
        "level": "Advanced",
        "description": "Develop enterprise applications using Spring Boot.",
    },
    {
        "title": "REST API Development",
        "category": "Backend",
        "level": "Advanced",
        "description": "Design and develop RESTful backend services.",
    },

    # DATABASE - 6
    {
        "title": "SQL Fundamentals",
        "category": "Database",
        "level": "Beginner",
        "description": "Learn SQL queries and relational database concepts.",
    },
    {
        "title": "MySQL Database",
        "category": "Database",
        "level": "Beginner",
        "description": "Manage relational databases using MySQL.",
    },
    {
        "title": "PostgreSQL Database",
        "category": "Database",
        "level": "Intermediate",
        "description": "Work with PostgreSQL databases and queries.",
    },
    {
        "title": "MongoDB Database",
        "category": "Database",
        "level": "Intermediate",
        "description": "Learn NoSQL database concepts using MongoDB.",
    },
    {
        "title": "Advanced SQL",
        "category": "Database",
        "level": "Advanced",
        "description": "Explore joins, subqueries, CTEs and window functions.",
    },
    {
        "title": "Database Design",
        "category": "Database",
        "level": "Advanced",
        "description": "Learn database modelling and normalization.",
    },

    # AI/ML - 8
    {
        "title": "Artificial Intelligence Fundamentals",
        "category": "AI/ML",
        "level": "Beginner",
        "description": "Understand the foundations of artificial intelligence.",
    },
    {
        "title": "Data Science with Python",
        "category": "AI/ML",
        "level": "Beginner",
        "description": "Explore data analysis and visualization using Python.",
    },
    {
        "title": "Machine Learning",
        "category": "AI/ML",
        "level": "Intermediate",
        "description": "Learn machine learning algorithms and model training.",
    },
    {
        "title": "Deep Learning",
        "category": "AI/ML",
        "level": "Advanced",
        "description": "Explore neural networks and deep learning architectures.",
    },
    {
        "title": "Natural Language Processing",
        "category": "AI/ML",
        "level": "Advanced",
        "description": "Work with text processing and language models.",
    },
    {
        "title": "Computer Vision",
        "category": "AI/ML",
        "level": "Advanced",
        "description": "Understand image processing and computer vision.",
    },
    {
        "title": "Generative AI",
        "category": "AI/ML",
        "level": "Intermediate",
        "description": "Explore generative AI models and applications.",
    },
    {
        "title": "Prompt Engineering",
        "category": "AI/ML",
        "level": "Intermediate",
        "description": "Learn techniques for writing effective AI prompts.",
    },

    # PROGRAMMING - 4
    {
        "title": "C Programming",
        "category": "Programming",
        "level": "Beginner",
        "description": "Learn programming fundamentals using C.",
    },
    {
        "title": "C++ Programming",
        "category": "Programming",
        "level": "Intermediate",
        "description": "Understand object-oriented programming using C++.",
    },
    {
        "title": "Data Structures and Algorithms",
        "category": "Programming",
        "level": "Advanced",
        "description": "Learn essential data structures and algorithms.",
    },
    {
        "title": "Java Programming",
        "category": "Programming",
        "level": "Advanced",
        "description": "Learn Java programming and object-oriented concepts.",
    },
]


class Command(BaseCommand):
    help = "Import the 30 TalentPath IQ courses into the database"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for course_data in COURSE_DATA:
            _, created = Course.objects.update_or_create(
                title=course_data["title"],
                defaults={
                    "category": course_data["category"],
                    "level": course_data["level"],
                    "description": course_data["description"],
                    "duration": "",
                    "image": None,
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Course import completed! "
                f"Created: {created_count}, "
                f"Updated: {updated_count}, "
                f"Total in database: {Course.objects.count()}"
            )
        )
