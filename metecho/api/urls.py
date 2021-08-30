from django.urls import path
from rest_framework import routers

from .views import (
    CurrentUserViewSet,
    EpicViewSet,
    GitHubOrganizationViewSet,
    HookView,
    ProjectDependencyViewSet,
    ProjectViewSet,
    ScratchOrgViewSet,
    TaskViewSet,
    UserViewSet,
)

router = routers.DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("user", CurrentUserViewSet, basename="current-user")
router.register("projects", ProjectViewSet, basename="project")
router.register("epics", EpicViewSet, basename="epic")
router.register("tasks", TaskViewSet, basename="task")
router.register("scratch-orgs", ScratchOrgViewSet, basename="scratch-org")
router.register("organizations", GitHubOrganizationViewSet, basename="organization")
router.register("dependencies", ProjectDependencyViewSet, basename="dependency")
urlpatterns = router.urls + [
    path("hook/", HookView.as_view(), name="hook"),
    path(  # Current user detail action without PK
        "user/",
        CurrentUserViewSet.as_view({"get": "retrieve"}),
        name="current-user-detail",
    ),
]
