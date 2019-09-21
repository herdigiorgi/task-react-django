from django.db.models import (
    Model, CharField, TextField, ForeignKey, ManyToManyField,
    PositiveSmallIntegerField, BooleanField, URLField,
    DateTimeField,
    CASCADE, SET_DEFAULT
)
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.conf import settings
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token


class User(AbstractUser):
    picture = URLField(
        default="https://randomuser.me/api/portraits/lego/1.jpg"
    )
    is_admin = BooleanField(default=False)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Status(Model):
    NEW = 1
    IN_PROGRESS = 2
    COMPLETED = 3
    ARCHIVED = 4
    STATUS_CHOICES = (
        (NEW, 'new'),
        (IN_PROGRESS, 'in progress'),
        (COMPLETED, 'completed'),
        (ARCHIVED, 'archived')
    )

    id = PositiveSmallIntegerField(choices=STATUS_CHOICES, primary_key=True)

    def __str__(self):
        for (x, name) in Status.STATUS_CHOICES:
            if x == self.id:
                return name
        raise RuntimeError(f"Invalid Status {self.id}")


class Task(Model):
    title = CharField(max_length=100)
    description = TextField()
    created_by = ForeignKey(
        User, null=False, blank=False, on_delete=CASCADE,
        related_name='created_by_set'
    )
    created_at = DateTimeField(auto_now_add=True)
    assignees = ManyToManyField(
        User, related_name='assignees_set', blank=True
    )
    status = ForeignKey(
        Status, null=False, default=Status.ARCHIVED,
        on_delete=SET_DEFAULT
    )


class Comment(Model):
    user = ForeignKey(User, null=False, on_delete=CASCADE)
    task = ForeignKey(Task, null=False, on_delete=CASCADE)
    created_at = DateTimeField(auto_now_add=True)
    text = TextField(max_length=500, null=False, blank=False)
