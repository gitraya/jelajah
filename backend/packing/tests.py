from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.urls import reverse

from .models import PackingItem, PackingCategory
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class PackingModelTests(TestCase):
    """Model tests for packing items"""

    def setUp(self):
        self.user = User.objects.create_user(email="packuser@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="Pack Trip", destination="P", start_date=date.today()+timedelta(days=4), end_date=date.today()+timedelta(days=6))
        self.cat = PackingCategory.objects.create(name="Clothes")
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)

    def test_create_packing_item(self):
        item = PackingItem.objects.create(trip=self.trip, name="Shirt", category=self.cat, quantity=2)
        self.assertEqual(item.name, "Shirt")
        self.assertEqual(item.trip, self.trip)


class PackingAPITests(APITestCase):
    """API tests for packing endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="packapi@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="API Pack Trip", destination="P", start_date=date.today()+timedelta(days=4), end_date=date.today()+timedelta(days=8))
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)
        self.cat = PackingCategory.objects.create(name="Gadgets")
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_packing_items(self):
        data = {"name": "Camera", "category_id": str(self.cat.id), "quantity": 1, "packed": False, "assigned_to_id": str(self.member.id)}
        resp = self.client.post(reverse("packing-item-list", kwargs={"trip_id": self.trip.id}), data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resp = self.client.get(reverse("packing-item-list", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_mark_packed_and_statistics(self):
        item = PackingItem.objects.create(trip=self.trip, name="Hat", category=self.cat, quantity=1, packed=False)
        resp = self.client.patch(reverse("packing-item-detail", kwargs={"trip_id": self.trip.id, "pk": item.id}), {"packed": True}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_202_ACCEPTED))
        item.refresh_from_db()
        self.assertTrue(item.packed)
        resp = self.client.get(reverse("packing-statistics", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total_items", resp.data)
