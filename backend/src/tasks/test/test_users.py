from rest_framework.test import APITestCase
from tasks.test.common import fake_user_data
from tasks.models import User


class UserTestCase(APITestCase):
    fixtures = ['users']

    def test_list(self):
        res = self.client.get('/user/')
        self.assertEqual(8, len(res.data))
        for e in res.data:
            self.assertIn('id', e)
            self.assertIn('first_name', e)
            self.assertIn('last_name', e)
            self.assertIn('picture', e)
            self.assertIn('is_admin', e)

    def test_retrive(self):
        user = User.objects.create_user(**fake_user_data())
        res = self.client.get(f'/user/{user.id}/')
        self.assertEqual(200, res.status_code, res)
        data = res.data
        self.assertEqual(user.id, data['id'])
        self.assertEqual(user.first_name, data['first_name'])
        self.assertEqual(user.last_name, data['last_name'])
        self.assertEqual(user.picture, data['picture'])
        self.assertEqual(user.email, data['email'])
        self.assertEqual(user.is_admin, data['is_admin'])
