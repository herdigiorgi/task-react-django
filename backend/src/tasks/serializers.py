from rest_framework.serializers import (
    ModelSerializer, Field, ValidationError
)
from .models import (
    User, Comment, Task, Status
)


class StatusField(Field):
    def to_representation(self, obj):
        for (x, name) in Status.STATUS_CHOICES:
            if x == obj.id:
                return name
        raise RuntimeError(f"Invalid Status {obj}")

    def to_internal_value(self, data):
        for (x, name) in Status.STATUS_CHOICES:
            if name == data:
                return Status(x)
        raise ValidationError(f"{data} is not a valid status")


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'is_admin',
                  'picture', 'email']


class CommentSerializer(ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text', 'created_at', 'user']
        read_only_fields = ['user', 'created_at', 'user']


class TaskSerializer(ModelSerializer):
    status = StatusField(required=False)

    class Meta:
        model = Task
        fields = ['title', 'description', 'assignees', 'status',
                  'created_by', 'id']
        read_only_fields = ['created_by', 'created_at', 'id']
