from django.urls import path
from .views import check_duplicate, recent_files

urlpatterns = [
    # Both inside the app's urls.py
    path('check-duplicate/', check_duplicate, name='check-duplicate'),
    path('recent-files/', recent_files, name='recent-files'),
]
