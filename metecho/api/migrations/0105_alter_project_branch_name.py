# Generated by Django 3.2.4 on 2021-06-25 14:47

import re

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0104_project_currently_fetching_github_users"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="branch_name",
            field=models.CharField(
                blank=True,
                max_length=100,
                validators=[
                    django.core.validators.RegexValidator(
                        re.compile("^[-\\w/]+\\Z"),
                        (
                            "Enter a valid 'branch' consisting of Unicode letters, "
                            "numbers, underscores, slashes, or hyphens."
                        ),
                        "invalid",
                    )
                ],
            ),
        ),
    ]
