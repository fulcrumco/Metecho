# Generated by Django 3.2 on 2021-04-20 21:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0099_normalize_project_collaborators"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="task",
            name="assigned_dev",
        ),
        migrations.RemoveField(
            model_name="task",
            name="assigned_qa",
        ),
        migrations.RenameField(
            model_name="task",
            old_name="assigned_dev_id",
            new_name="assigned_dev",
        ),
        migrations.RenameField(
            model_name="task",
            old_name="assigned_qa_id",
            new_name="assigned_qa",
        ),
    ]
