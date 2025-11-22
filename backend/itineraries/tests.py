from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from datetime import date, timedelta, datetime
from django.utils import timezone
from .models import ItineraryItem, ItineraryType, ItineraryStatus
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ItineraryItemModelTests(TestCase):
    """Test cases for ItineraryItem model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.trip = Trip.objects.create(
            owner=self.user,
            title='Test Trip',
            destination='Tokyo',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.itinerary_type, _ = ItineraryType.objects.get_or_create(name='Museum')

    def test_create_itinerary_item(self):
        """Test creating an itinerary item"""
        item = ItineraryItem.objects.create(
            trip=self.trip,
            name='Tokyo Tower',
            address='4-2-8 Shibakoen, Minato City, Tokyo',
            type=self.itinerary_type,
            description='Famous landmark',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.PLANNED
        )
        self.assertEqual(item.name, 'Tokyo Tower')
        self.assertEqual(item.trip, self.trip)
        self.assertEqual(item.type, self.itinerary_type)
        self.assertEqual(item.status, ItineraryStatus.PLANNED)

    def test_itinerary_item_str_representation(self):
        """Test string representation of ItineraryItem"""
        visit_time = timezone.now() + timedelta(days=2)
        item = ItineraryItem.objects.create(
            trip=self.trip,
            name='Senso-ji Temple',
            visit_time=visit_time
        )
        expected_str = f"{visit_time} - Senso-ji Temple"
        self.assertEqual(str(item), expected_str)

    def test_itinerary_item_ordering(self):
        """Test itinerary items are ordered by visit_time"""
        item1 = ItineraryItem.objects.create(
            trip=self.trip,
            name='Morning Activity',
            visit_time=timezone.now() + timedelta(days=1, hours=8)
        )
        item2 = ItineraryItem.objects.create(
            trip=self.trip,
            name='Evening Activity',
            visit_time=timezone.now() + timedelta(days=1, hours=18)
        )
        items = ItineraryItem.objects.all()
        self.assertEqual(items[0], item1)
        self.assertEqual(items[1], item2)


class ItineraryItemViewSetTests(APITestCase):
    """Test cases for ItineraryItemViewSet API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.trip = Trip.objects.create(
            owner=self.user,
            title='Test Trip',
            destination='Paris',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.itinerary_type, _ = ItineraryType.objects.get_or_create(name='Restaurant')

    def test_create_itinerary_item(self):
        """Test creating an itinerary item"""
        self.client.force_authenticate(user=self.user)
        url = reverse('itinerary-item-list', kwargs={'trip_id': self.trip.id})
        visit_time = (timezone.now() + timedelta(days=2)).isoformat()
        data = {
            'name': 'Eiffel Tower',
            'address': 'Champ de Mars, Paris',
            'type_id': str(self.itinerary_type.id),
            'description': 'Iconic landmark',
            'visit_time': visit_time,
            'estimated_time': '2-3 hours',
            'status': ItineraryStatus.PLANNED
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Eiffel Tower')

    def test_list_itinerary_items(self):
        """Test listing itinerary items for a trip"""
        self.client.force_authenticate(user=self.user)
        
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Louvre Museum',
            visit_time=timezone.now() + timedelta(days=2)
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Notre-Dame Cathedral',
            visit_time=timezone.now() + timedelta(days=3)
        )
        
        url = reverse('itinerary-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_itinerary_item(self):
        """Test retrieving a specific itinerary item"""
        self.client.force_authenticate(user=self.user)
        item = ItineraryItem.objects.create(
            trip=self.trip,
            name='Arc de Triomphe',
            visit_time=timezone.now() + timedelta(days=2)
        )
        
        url = reverse('itinerary-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Arc de Triomphe')

    def test_update_itinerary_item(self):
        """Test updating an itinerary item"""
        self.client.force_authenticate(user=self.user)
        item = ItineraryItem.objects.create(
            trip=self.trip,
            name='Original Name',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.PLANNED
        )
        
        url = reverse('itinerary-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        data = {
            'name': 'Updated Name',
            'status': ItineraryStatus.VISITED
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Name')
        self.assertEqual(response.data['status'], ItineraryStatus.VISITED)

    def test_delete_itinerary_item(self):
        """Test deleting an itinerary item"""
        self.client.force_authenticate(user=self.user)
        item = ItineraryItem.objects.create(
            trip=self.trip,
            name='To Delete',
            visit_time=timezone.now() + timedelta(days=2)
        )
        
        url = reverse('itinerary-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ItineraryItem.objects.filter(id=item.id).exists())

    def test_filter_by_status(self):
        """Test filtering itinerary items by status"""
        self.client.force_authenticate(user=self.user)
        
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Planned Item',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.PLANNED
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Visited Item',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.VISITED
        )
        
        url = reverse('itinerary-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url, {'status': 'VISITED'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], ItineraryStatus.VISITED)

    def test_filter_by_type(self):
        """Test filtering itinerary items by type"""
        self.client.force_authenticate(user=self.user)
        
        type2, _ = ItineraryType.objects.get_or_create(name='Beach')
        
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Restaurant Visit',
            visit_time=timezone.now() + timedelta(days=2),
            type=self.itinerary_type
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Beach Visit',
            visit_time=timezone.now() + timedelta(days=2),
            type=type2
        )
        
        url = reverse('itinerary-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url, {'type_id': str(self.itinerary_type.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ItineraryItemStatisticsViewTests(APITestCase):
    """Test cases for ItineraryItemStatisticsView API endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.trip = Trip.objects.create(
            owner=self.user,
            title='Test Trip',
            destination='Rome',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )

    def test_itinerary_statistics(self):
        """Test itinerary statistics endpoint"""
        self.client.force_authenticate(user=self.user)
        
        # Create items with different statuses
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Visited Place',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.VISITED
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Planned Place 1',
            visit_time=timezone.now() + timedelta(days=2),
            status=ItineraryStatus.PLANNED
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Planned Place 2',
            visit_time=timezone.now() + timedelta(days=3),
            status=ItineraryStatus.PLANNED
        )
        ItineraryItem.objects.create(
            trip=self.trip,
            name='Skipped Place',
            visit_time=timezone.now() + timedelta(days=4),
            status=ItineraryStatus.SKIPPED
        )
        
        url = reverse('itinerary-statistics', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 4)
        self.assertEqual(response.data['visited'], 1)
        self.assertEqual(response.data['planned'], 2)
        self.assertEqual(response.data['skipped'], 1)
