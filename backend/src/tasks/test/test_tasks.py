from rest_framework.test import APITestCase
from tasks.test.common import authenticated, fake_user_data
from tasks.models import User
from faker import Faker


def fake_base_task_data():
    def gen(x):
        fake = Faker()
        return fake.sentence(nb_words=x, variable_nb_words=True,
                             ext_word_list=None)
    return {
        'title': gen(4),
        'description': gen(12)
    }


class TaskTestCase(APITestCase):
    fixtures = ['users']

    def setUp(self):
        self.fake = Faker()
        self.user = User.objects.create_user(
            **fake_user_data()
        )
        self.user_1 = User.objects.create_user(
            **fake_user_data()
        )
        self.user_2 = User.objects.create_user(
            **fake_user_data()
        )
        self.admin = User.objects.create_user(
            **fake_user_data(),
            is_admin=True
        )

    def test_list_unauthorized(self):
        res = self.client.get('/task/')
        self.assertEqual(401, res.status_code)

    def test_list_authorized(self):
        res = authenticated(self.user).get('/task/')
        self.assertEqual([], res.data)

    def test_task_creation(self):
        data = fake_base_task_data()
        res = authenticated(self.user).post('/task/', data)
        self.assertEqual(200, res.status_code, res.data)
        self.assertEqual(1, len(res.data), res.data)
        created = res.data[0]
        self.assertIn('id', created)
        self.assertEqual(data['title'], created['title'])
        self.assertEqual(data['description'], created['description'])
        self.assertEqual('new', res.data[0]['status'])

    def test_deletion(self):
        res = authenticated(self.user).post('/task/', fake_base_task_data())
        id = res.data[0]['id']
        res = authenticated(self.user).delete(f'/task/{id}/')
        self.assertEqual(403, res.status_code, res.data)
        res = authenticated(self.admin).delete(f'/task/{id}/')
        self.assertEqual(200, res.status_code, res.data)
        self.assertEqual(1, len(res.data), res.data)
        self.assertEqual('archived', res.data[0]['status'])

    def test_creation_with_assignees(self):
        data = fake_base_task_data()
        data['assignees'] = [
            self.user_1.id,
            self.user_2.id
        ]
        res = authenticated(self.user).post('/task/', data)
        self.assertEqual(200, res.status_code, res.data)
        self.assertEqual(data['assignees'], res.data[0]['assignees'])

    def test_modify(self):
        data = fake_base_task_data()
        res = authenticated(self.user).post('/task/', data)
        data = res.data[0]
        data['assignees'] = [self.user_1.id]
        data['title'] = self.fake.name()
        data['description'] = self.fake.name()
        data['status'] = 'in progress'
        id = data['id']
        res = authenticated(self.user).patch(f'/task/{id}/', data)
        self.assertEqual(200, res.status_code, res.data)
        self.assertEqual(data, res.data[0])

    def test_get_no_comments(self):
        res = authenticated(self.user).post('/task/', fake_base_task_data())
        id = res.data[0]['id']
        res = authenticated(self.user).get(f'/task/{id}/comments/')
        self.assertEqual(200, res.status_code, res)
        self.assertEqual([], res.data)

    def test_add_comment(self):
        res = authenticated(self.user).post('/task/', fake_base_task_data())
        id = res.data[0]['id']
        text1 = self.fake.text()
        text2 = self.fake.text()
        res = authenticated(self.user).post(f'/task/{id}/comments/', {
            'text': text1
        })
        self.assertEqual(200, res.status_code)
        res = authenticated(self.user).post(f'/task/{id}/comments/', {
            'text': text2
        })
        self.assertEqual(200, res.status_code)
        self.assertEqual(2, len(res.data))
        self.assertEqual(text1, res.data[1]['text'])
        self.assertEqual(text2, res.data[0]['text'])
