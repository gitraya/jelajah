from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password="test12#$",
            first_name="Test",
            last_name="User"
        )


    def test_register_user(self):
        data = {
            "username": "newuser",
            "email": "test@example.com",
            "password": "test12#$",
            "password2": "test12#$",
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="test@example.com").exists())

    def test_register_user_missing_fields(self):
        data = {
            "username": "newuser",
            "email": "test@example.com",
            "password": "test12#$",
            "password2": "mismatch"
        }
        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("first_name", response.data)
    
    def test_register_user_password_mismatch(self):
        data = {
            "username": "newuser",
            "email": "test@example.com",
            "password": "test12#$",
            "password2": "mismatch",
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertIn("Password fields didn't match.", str(response.data))

    def test_login_user(self):
        data = {
            "username": "loginuser",
            "password": "test12#$"
        }
        response = self.client.post(reverse("token_obtain_pair"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_user_invalid_credentials(self):
        data = {
            "username": "loginuser",
            "password": "wrongpassword"
        }
        response = self.client.post(reverse("token_obtain_pair"), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_detail(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("user_detail"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
