# TPIQ-54 compatibility fix:
# Railway's existing courses_enrolment.student_id column is VARCHAR.
# Update Django's migration state to CharField without altering the existing DB column.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0003_enrolment"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name="enrolment",
                    name="student_id",
                    field=models.CharField(max_length=36),
                ),
            ],
        ),
    ]
