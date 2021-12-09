# Generated by Django 3.2.2 on 2021-05-13 15:34

from django.db import migrations, models

from metecho.api.models import TaskStatus


def set_task_canceled_statuses(apps, schema_editor):
    Task = apps.get_model("api", "Task")
    for instance in Task.objects.filter(
        status=TaskStatus.IN_PROGRESS, pr_is_open=False, pr_number__isnull=False
    ):
        instance.status = TaskStatus.CANCELED
        instance.save()


def unset_task_canceled_statuses(apps, schema_editor):
    Task = apps.get_model("api", "Task")
    for instance in Task.objects.filter(status=TaskStatus.CANCELED):
        instance.status = TaskStatus.IN_PROGRESS
        instance.save()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0102_merge_20210426_2054"),
    ]

    operations = [
        migrations.AlterField(
            model_name="task",
            name="status",
            field=models.CharField(
                choices=[
                    ("Planned", "Planned"),
                    ("In progress", "In Progress"),
                    ("Completed", "Completed"),
                    ("Canceled", "Canceled"),
                ],
                default="Planned",
                max_length=16,
            ),
        ),
        migrations.RunPython(set_task_canceled_statuses, unset_task_canceled_statuses),
    ]
