from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from faker import Faker


def authenticated(userobj):
    if userobj is str:
        token = Token.objects.get(user__username=userobj)
    else:
        token = Token.objects.get(user=userobj)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
    return client


def fake_user_data():
    fake = Faker()
    profile = fake.profile(fields=None, sex=None)
    return {
        "username": profile['username'],
        "first_name": fake.first_name(),
        "last_name": fake.last_name(),
        "email": profile['mail']
    }
