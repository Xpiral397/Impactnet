"""
URL configuration for impactnet project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('posts.urls')),
    path('api/ai/', include('ai_services.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/chat/', include('chat.urls')),
]
