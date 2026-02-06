from django.urls import path
from .views import check_duplicate, recent_files

urlpatterns = [
    path('check-duplicate/', check_duplicate, name='check-duplicate'),
    path('recent-files/', recent_files, name='recent-files'),
]
