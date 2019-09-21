from django.db import migrations
from tasks.models import Status


def create_status(apps, schema_editor):
    for s in Status.STATUS_CHOICES:
        Status(pk=s[0]).save()


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_status)
    ]


