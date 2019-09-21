from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from tasks.views import UserViewSet, TaskViewSet, AuthToken


router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'task', TaskViewSet, basename='task')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('token/<int:user_id>/', AuthToken.as_view())
] + router.urls
