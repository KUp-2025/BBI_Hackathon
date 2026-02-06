from django.urls import path
from .views import check_duplicate

urlpatterns = [
    path('check-duplicate/', check_duplicate, name='check-duplicate'),
]
