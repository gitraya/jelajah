from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import timedelta, date
from django.urls import reverse
from django.utils import timezone

from .models import ItineraryItem, ItineraryType, ItineraryStatus
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ItineraryModelTests(TestCase):
    """Model tests for itinerary items"""

    def setUp(self):
        self.user = User.objects.create_user(email="ituser@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="IT Trip", destination="Z", start_date=date.today()+timedelta(days=5), end_date=date.today()+timedelta(days=7))
        self.it_type = ItineraryType.objects.create(name="Historical")
    def test_create_itinerary_item(self):
        visit_time = timezone.now() + timedelta(days=6)
        item = ItineraryItem.objects.create(trip=self.trip, name="Visit", type=self.it_type, visit_time=visit_time)
        item = ItineraryItem.objects.create(trip=self.trip, name="Visit", type=self.it_type, visit_time=visit_time)
        self.assertEqual(item.name, "Visit")
        self.assertEqual(item.trip, self.trip)


class ItineraryAPITests(APITestCase):
    """API tests for itinerary endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="itapi@example.com", password="testpass123")
        self.trip = Trip.objects.create(owner=self.user, title="API IT Trip", destination="Z", start_date=date.today()+timedelta(days=5), end_date=date.today()+timedelta(days=8))
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)
        self.it_type = ItineraryType.objects.create(name="Adventure")
        self.client.force_authenticate(user=self.user)
    def test_create_and_list_itinerary_items(self):
        visit_time = (timezone.now() + timedelta(days=6)).isoformat()
        data = {
            "name": "Beach Visit",
            "type_id": str(self.it_type.id),
            "visit_time": visit_time,
            "status": ItineraryStatus.PLANNED
        }
        resp = self.client.post(reverse("itinerary-item-list", kwargs={"trip_id": self.trip.id}), data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resp = self.client.get(reverse("itinerary-item-list", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data) >= 1)

    def test_itinerary_statistics(self):
        ItineraryItem.objects.create(trip=self.trip, name="A", type=self.it_type, status=ItineraryStatus.PLANNED)
        ItineraryItem.objects.create(trip=self.trip, name="B", type=self.it_type, status=ItineraryStatus.VISITED)
        resp = self.client.get(reverse("itinerary-statistics", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total", resp.data)
        self.assertIn("visited", resp.data)
