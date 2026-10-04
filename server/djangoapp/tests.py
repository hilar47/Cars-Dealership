import json
from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase


def post_json(client, url, payload):
    return client.post(url, data=json.dumps(payload), content_type="application/json")


class AuthTests(TestCase):
    def test_register_login_logout(self):
        resp = post_json(self.client, "/djangoapp/register", {
            "userName": "alice", "password": "S3cure-pass!", "firstName": "Alice",
            "lastName": "Doe", "email": "alice@example.com",
        })
        self.assertEqual(resp.json(), {"userName": "alice", "status": "Authenticated"})
        self.assertTrue(User.objects.filter(username="alice").exists())

        self.client.get("/djangoapp/logout")
        resp = post_json(self.client, "/djangoapp/login", {"userName": "alice", "password": "S3cure-pass!"})
        self.assertEqual(resp.json()["status"], "Authenticated")

        resp = self.client.get("/djangoapp/logout")
        self.assertEqual(resp.json(), {"userName": ""})

    def test_duplicate_registration(self):
        User.objects.create_user("bob", password="x")
        resp = post_json(self.client, "/djangoapp/register", {"userName": "bob", "password": "x"})
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.json()["error"], "Already Registered")

    def test_bad_login(self):
        resp = post_json(self.client, "/djangoapp/login", {"userName": "nobody", "password": "nope"})
        self.assertEqual(resp.status_code, 401)


class CarTests(TestCase):
    def test_get_cars_populates(self):
        resp = self.client.get("/djangoapp/get_cars")
        cars = resp.json()["CarModels"]
        self.assertGreater(len(cars), 10)
        self.assertIn({"CarModel": "Pathfinder", "CarMake": "NISSAN"}, cars)


class ProxyTests(TestCase):
    @mock.patch("djangoapp.views.get_request")
    def test_dealers_by_state(self, get_request):
        get_request.return_value = [{"id": 1, "state": "Kansas"}]
        resp = self.client.get("/djangoapp/get_dealers/Kansas")
        get_request.assert_called_once_with("/fetchDealers/Kansas")
        self.assertEqual(resp.json()["dealers"][0]["state"], "Kansas")

    @mock.patch("djangoapp.views.get_request", return_value=None)
    def test_backend_down(self, _):
        self.assertEqual(self.client.get("/djangoapp/get_dealers").status_code, 502)

    @mock.patch("djangoapp.views.analyze_review_sentiments", return_value={"sentiment": "positive"})
    @mock.patch("djangoapp.views.get_request")
    def test_reviews_get_sentiment(self, get_request, _):
        get_request.return_value = [{"id": 1, "review": "Great!"}]
        resp = self.client.get("/djangoapp/reviews/dealer/1")
        self.assertEqual(resp.json()["reviews"][0]["sentiment"], "positive")

    @mock.patch("djangoapp.views.post_review", return_value={"id": 99})
    def test_add_review_requires_login(self, post_review):
        resp = post_json(self.client, "/djangoapp/add_review", {"review": "ok"})
        self.assertEqual(resp.status_code, 403)
        post_review.assert_not_called()

        User.objects.create_user("carol", password="pw12345!")
        self.client.login(username="carol", password="pw12345!")
        resp = post_json(self.client, "/djangoapp/add_review", {"review": "ok"})
        self.assertEqual(resp.json()["status"], 200)
