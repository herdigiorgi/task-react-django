from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from .models import (
    User, Task, Comment
)

admin.site.register(User, UserAdmin)
admin.site.register(Task)
admin.site.register(Comment)
