from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from django.urls import reverse

from .models import ChecklistItem, ChecklistCategory, ChecklistPriority
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ChecklistModelTests(TestCase):
    """Model tests for checklist items"""

    def setUp(self):
        self.user = User.objects.create_user(email="checkuser@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="Check Trip", destination="C", start_date=date.today()+timedelta(days=2), end_date=date.today()+timedelta(days=4))
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)

    def test_create_checklist_item(self):
        item = ChecklistItem.objects.create(trip=self.trip, title="Pack passport", category=ChecklistCategory.PRE_TRIP, priority=ChecklistPriority.HIGH, is_completed=False)
        self.assertEqual(item.title, "Pack passport")
        self.assertFalse(item.is_completed)


class ChecklistAPITests(APITestCase):
    """API tests for checklist endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="checkapi@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="API Check Trip", destination="C", start_date=date.today()+timedelta(days=2), end_date=date.today()+timedelta(days=6))
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_checklist_items(self):
        data = {"title": "Buy adapter", "category": ChecklistCategory.PRE_TRIP, "priority": ChecklistPriority.MEDIUM, "position": 1, "assigned_to_id": str(self.member.id)}
        resp = self.client.post(reverse("checklist-item-list", kwargs={"trip_id": self.trip.id}), data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resp = self.client.get(reverse("checklist-item-list", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_mark_completed_and_statistics(self):
        item = ChecklistItem.objects.create(trip=self.trip, title="Visa", category=ChecklistCategory.PRE_TRIP, is_completed=False)
        resp = self.client.patch(reverse("checklist-item-detail", kwargs={"trip_id": self.trip.id, "pk": item.id}), {"is_completed": True}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_202_ACCEPTED))
        item.refresh_from_db()
        self.assertTrue(item.is_completed)
        resp = self.client.get(reverse("checklist-statistics", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total_items", resp.data)
