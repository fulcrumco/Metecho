# Generated by Django 3.2.5 on 2021-08-12 19:45

import hashid_field.field
import sfdo_template_helpers.fields.string
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0105_alter_project_branch_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="GitHubOrganization",
            fields=[
                (
                    "id",
                    hashid_field.field.HashidAutoField(
                        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",  # noqa
                        min_length=7,
                        prefix="",
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("edited_at", models.DateTimeField(auto_now=True)),
                ("name", sfdo_template_helpers.fields.string.StringField()),
                (
                    "login",
                    sfdo_template_helpers.fields.string.StringField(
                        help_text="Organization's 'username' on GitHub", unique=True
                    ),
                ),
            ],
            options={
                "verbose_name": "GitHub organization",
                "ordering": ("name",),
            },
        ),
    ]
