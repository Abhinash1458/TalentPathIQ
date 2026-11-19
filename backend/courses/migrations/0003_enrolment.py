# TPIQ-54: keep an existing demo enrolment table and its rows, while making
# sure every field required by the current Enrolment model is present.
from django.db import migrations, models
from django.utils import timezone
import django.db.models.deletion


def prepare_enrolment_table(apps, schema_editor):
    Enrolment = apps.get_model("courses", "Enrolment")
    table_name = Enrolment._meta.db_table
    existing_tables = schema_editor.connection.introspection.table_names()

    if table_name not in existing_tables:
        schema_editor.create_model(Enrolment)

    with schema_editor.connection.cursor() as cursor:
        description = schema_editor.connection.introspection.get_table_description(cursor, table_name)
    existing_columns = {column.name for column in description}

    # Existing Railway demo rows already have student_id and course_id. Add
    # optional/defaulted metadata columns only when an older table lacks them.
    missing_fields = [
        ("enrolled_at", models.DateTimeField(default=timezone.now)),
        ("status", models.CharField(max_length=20, default="not_started")),
        ("progress_percent", models.PositiveSmallIntegerField(default=0)),
        ("last_lesson_id", models.CharField(max_length=100, null=True, blank=True)),
    ]
    for field_name, field in missing_fields:
        if field_name not in existing_columns:
            field.set_attributes_from_name(field_name)
            field.model = Enrolment
            schema_editor.add_field(Enrolment, field)

    with schema_editor.connection.cursor() as cursor:
        constraints = schema_editor.connection.introspection.get_constraints(cursor, table_name)
    constraint_name = "unique_student_course_enrolment"
    if constraint_name not in constraints:
        schema_editor.add_constraint(
            Enrolment,
            models.UniqueConstraint(
                fields=("student_id", "course"),
                name=constraint_name,
            ),
        )


class Migration(migrations.Migration):
    dependencies = [("courses", "0002_alter_course_duration")]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name="Enrolment",
                    fields=[
                        ("id", models.BigAutoField(
                            auto_created=True,
                            primary_key=True,
                            serialize=False,
                            verbose_name="ID",
                        )),
                        ("student_id", models.CharField(max_length=36)),
                        ("enrolled_at", models.DateTimeField(auto_now_add=True)),
                        ("status", models.CharField(
                            choices=[
                                ("not_started", "Not started"),
                                ("in_progress", "In progress"),
                                ("completed", "Completed"),
                            ],
                            default="not_started",
                            max_length=20,
                        )),
                        ("progress_percent", models.PositiveSmallIntegerField(default=0)),
                        ("last_lesson_id", models.CharField(
                            blank=True,
                            max_length=100,
                            null=True,
                        )),
                        ("course", models.ForeignKey(
                            on_delete=django.db.models.deletion.CASCADE,
                            related_name="enrolments",
                            to="courses.course",
                        )),
                    ],
                    options={"db_table": "courses_enrolment"},
                ),
                migrations.AddConstraint(
                    model_name="enrolment",
                    constraint=models.UniqueConstraint(
                        fields=("student_id", "course"),
                        name="unique_student_course_enrolment",
                    ),
                ),
            ],
        ),
        migrations.RunPython(
            prepare_enrolment_table,
            migrations.RunPython.noop,
        ),
    ]
