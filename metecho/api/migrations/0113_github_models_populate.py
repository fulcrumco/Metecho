# Generated by Django 4.0.5 on 2022-07-12 22:21

from django.db import migrations


def forwards(apps, schema_editor):
    GitHubCollaboration = apps.get_model("api", "GitHubCollaboration")
    GitHubUser = apps.get_model("api", "GitHubUser")
    Project = apps.get_model("api", "Project")
    Epic = apps.get_model("api", "Epic")
    Task = apps.get_model("api", "Task")

    # Create GitHubCollaboration objects from Project.github_users
    for project in Project.objects.all():
        for collaborator in project.github_users_json:
            name = collaborator.get("name")
            avatar_url = collaborator.get("avatar_url")
            user, _ = GitHubUser.objects.update_or_create(
                id=collaborator["id"],
                defaults={
                    "login": collaborator["login"],
                    "name": name or "",
                    "avatar_url": avatar_url or "",
                },
            )

            GitHubCollaboration.objects.create(
                project=project, user=user, permissions=collaborator.get("permissions")
            )

    # Convert JSON Epic collaborators into m2m entries
    for epic in Epic.objects.all():
        for user_id in epic.github_users_json:
            user = GitHubUser.objects.get(id=user_id)
            epic.github_users.add(user)

    # Convert Task assignees into GitHubUser instances
    for task in Task.objects.all():
        if task.assigned_dev_old:
            task.assigned_dev = GitHubUser.objects.get(id=task.assigned_dev_old)
        if task.assigned_qa_old:
            task.assigned_qa = GitHubUser.objects.get(id=task.assigned_qa_old)
        if task.assigned_dev or task.assigned_qa:
            task.save()


def backwards(apps, schema_editor):
    SocialAccount = apps.get_model("socialaccount", "SocialAccount")
    GitHubRepository = apps.get_model("api", "GitHubRepository")
    Project = apps.get_model("api", "Project")
    Epic = apps.get_model("api", "Epic")
    Task = apps.get_model("api", "Task")

    # Update Project.github_users from GitHubCollaboration objects
    for project in Project.objects.all():
        project.github_users_json = []
        for collaboration in project.githubcollaboration_set.all():
            project.github_users_json.append(
                {
                    "id": str(collaboration.user_id),
                    "login": collaboration.user.login,
                    "name": collaboration.user.name,
                    "avatar_url": collaboration.user.avatar_url,
                    "permissions": collaboration.permissions,
                }
            )

            account = SocialAccount.objects.filter(
                provider="github", uid=str(collaboration.user_id)
            ).first()
            if account is None:
                continue
            GitHubRepository.objects.create(
                user=account.user,
                repo_id=project.repo_id,
                permissions=collaboration.permissions,
                repo_url=f"https://github.com/{project.repo_owner}/{project.repo_name}",
            )
        project.save()

    # Convert the Epic collaborator m2m field into JSON entries
    for epic in Epic.objects.all():
        epic.github_users_json = list(
            str(id) for id in epic.github_users.values_list("id", flat=True)
        )
        epic.save()

    # Convert Task assignees into plain IDs
    for task in Task.objects.all():
        if task.assigned_dev:
            task.assigned_dev_old = task.assigned_dev_id
        if task.assigned_qa:
            task.assigned_qa_old = task.assigned_qa_id
        if task.assigned_dev_old or task.assigned_qa_old:
            task.save()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0112_github_models_refactor_start"),
        ("socialaccount", "0003_extra_data_default_dict"),
    ]

    operations = [migrations.RunPython(forwards, reverse_code=backwards)]
