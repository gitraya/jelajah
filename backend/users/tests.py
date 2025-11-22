from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class UserRegistrationTests(TestCase):
    """Tests for user registration, login, and detail endpoints using email-based User model."""

    def setUp(self):
        self.client = APIClient()
        # create an existing user for login/detail tests
        self.user = User.objects.create_user(
            email="login@example.com",
            password="Test12#$",
            first_name="Test",
            last_name="User"
        )

    def test_register_user_success(self):
        """Registering a new user with email should succeed."""
        data = {
            "email": "test@example.com",
            "password": "Test12#$",
            "password2": "Test12#$",
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(reverse("register"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="test@example.com").exists())

    def test_register_user_missing_fields(self):
        """Missing required fields should return 400 with field errors."""
        data = {
            "email": "test2@example.com",
            "password": "Test12#$",
            "password2": "Test12#$",
            # missing first_name (required by RegisterSerializer)
        }
        response = self.client.post(reverse("register"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("first_name", response.data)

    def test_register_user_password_mismatch(self):
        """Mismatched passwords should return validation error."""
        data = {
            "email": "test3@example.com",
            "password": "Test12#$",
            "password2": "mismatch",
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(reverse("register"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", str(response.data))

    def test_login_user_success(self):
        """Login (token obtain) using email should succeed for valid credentials."""
        data = {
            "email": "login@example.com",
            "password": "Test12#$"
        }
        response = self.client.post(reverse("token_obtain_pair"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("Login successful" in response.data or "message" in response.data)

    def test_login_user_invalid_credentials(self):
        """Invalid login credentials should be rejected."""
        data = {
            "email": "login@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post(reverse("token_obtain_pair"), data, format="json")
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST))

    def test_get_user_detail_authenticated(self):
        """Authenticated user can get their own details via user_detail endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("user_detail"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("email"), self.user.email)
