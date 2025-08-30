from django.urls import path
from .views import ActionList, ActionDetail

# Wiring URL routes for the actions app so views are reachable at the exact paths
#/api/actions for list + create
#/api/actions/<id> for update + delete

from django.urls import path
from .views import ActionList, ActionDetail

urlpatterns = [
    path("", ActionList.as_view(), name="action-list"),
    path("<int:action_id>/", ActionDetail.as_view(), name="action-detail"),
]