# Generated by Django 4.0.4 on 2022-05-10 19:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0111_user_currently_fetching_orgs_user_organizations"),
    ]

    operations = [
        migrations.AddField(
            model_name="githuborganization",
            name="avatar_url",
            field=models.URLField(blank=True, verbose_name="Avatar URL"),
        ),
    ]
