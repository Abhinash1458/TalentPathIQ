from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("courses", "0004_student_id_text_state")]

    operations = [
        migrations.AddField(model_name="enrolment", name="completed_lesson_ids", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="enrolment", name="last_accessed_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="enrolment", name="completed_at", field=models.DateTimeField(blank=True, null=True)),
    ]
