from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', lambda request: JsonResponse({
        "status": "ok",
        "service": "BBI Hackathon Backend"
    })),
    path('admin/', admin.site.urls),
    path('api/', include('downloads.urls')),
]
