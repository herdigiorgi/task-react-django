from rest_framework.viewsets import GenericViewSet, ViewSet
from rest_framework.views import APIView
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from .models import (
    User, Task, Status, Comment
)
from .serializers import (
    UserSerializer, TaskSerializer, CommentSerializer
)


class UserViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        qs = User.objects.all().order_by('is_admin')
        s = UserSerializer(qs, many=True)
        return Response(s.data)


class TaskViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        qs = Task.objects.all().order_by('-created_at')
        s = TaskSerializer(qs, many=True)
        return Response(s.data)

    def destroy(self, request, pk=None):
        if not request.user.is_admin:
            raise PermissionDenied()
        if not pk:
            raise ValidationError()
        Task.objects.filter(pk=pk).update(status=Status.ARCHIVED)
        return self.list(request)

    def create(self, request):
        s = TaskSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data
        data['status'] = Status(Status.NEW)
        assignees = data.get('assignees', [])
        if 'assignees' in data:
            del data['assignees']
        task = Task.objects.create(
            created_by=request.user, **data
        )
        if assignees:
            task.assignees.set(assignees)
        return self.list(request)

    def partial_update(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        s = TaskSerializer(task, request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.update(task, s.validated_data)
        return self.list(request)

    @action(url_path='comments', detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        if request.method == 'GET':
            return self.list_comments(request, pk)
        if request.method == 'POST':
            return self.add_comment(request, pk)

    def list_comments(self, request, pk=None):
        qs = Comment.objects.all().filter(task__id=pk).order_by('-created_at')
        s = CommentSerializer(qs, many=True)
        return Response(s.data)

    def add_comment(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        s = CommentSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        Comment.objects.create(
            **s.validated_data,
            task=task,
            user=request.user
        )
        return self.list_comments(request, pk)


class AuthToken(APIView):

    def post(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        token, created = Token.objects.get_or_create(user__id=user_id)
        user_serializer = UserSerializer(user)
        data = user_serializer.data
        data['token'] = token.key
        return Response(data)
