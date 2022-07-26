# Generated by Django 4.0.5 on 2022-07-12 21:59
import django.db.models.deletion
import sfdo_template_helpers.fields.string
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0111_alter_user_organizations"),
    ]

    operations = [
        migrations.CreateModel(
            name="GitHubCollaboration",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("permissions", models.JSONField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name="GitHubUser",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("login", sfdo_template_helpers.fields.string.StringField()),
                ("name", sfdo_template_helpers.fields.string.StringField()),
                ("avatar_url", models.URLField()),
            ],
            options={
                "verbose_name": "GitHub user",
                "verbose_name_plural": "GitHub users",
                "ordering": ("login",),
            },
        ),
        migrations.AddField(
            model_name="githubcollaboration",
            name="project",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="api.project"
            ),
        ),
        migrations.AddField(
            model_name="githubcollaboration",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="api.githubuser"
            ),
        ),
        migrations.RenameField(
            model_name="epic",
            new_name="github_users_json",
            old_name="github_users",
        ),
        migrations.AddField(
            model_name="epic",
            name="github_users",
            field=models.ManyToManyField(
                related_name="epics", to="api.githubuser", blank=True
            ),
        ),
        migrations.RenameField(
            model_name="project",
            new_name="github_users_json",
            old_name="github_users",
        ),
        migrations.AddField(
            model_name="project",
            name="github_users",
            field=models.ManyToManyField(
                to="api.githubuser",
                through="api.GitHubCollaboration",
                related_name="projects",
                blank=True,
            ),
        ),
        migrations.RenameField(
            model_name="task",
            new_name="assigned_dev_old",
            old_name="assigned_dev",
        ),
        migrations.RenameField(
            model_name="task",
            new_name="assigned_qa_old",
            old_name="assigned_qa",
        ),
        migrations.AddField(
            model_name="task",
            name="assigned_dev",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="dev_tasks",
                to="api.githubuser",
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="assigned_qa",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="qa_tasks",
                to="api.githubuser",
            ),
        ),
    ]
