from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from datetime import date, timedelta
from .models import ChecklistItem, ChecklistCategory, ChecklistPriority
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ChecklistItemModelTests(TestCase):
    """Test cases for ChecklistItem model"""

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
            destination='London',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )

    def test_create_checklist_item(self):
        """Test creating a checklist item"""
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Book flight tickets',
            description='Book flights for the whole group',
            category=ChecklistCategory.PRE_TRIP,
            priority=ChecklistPriority.HIGH,
            due_date=date.today() - timedelta(days=1),
            is_completed=False,
            assigned_to=self.trip_member
        )
        self.assertEqual(item.title, 'Book flight tickets')
        self.assertEqual(item.category, ChecklistCategory.PRE_TRIP)
        self.assertEqual(item.priority, ChecklistPriority.HIGH)
        self.assertFalse(item.is_completed)

    def test_checklist_item_str_representation(self):
        """Test string representation of ChecklistItem"""
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Reserve hotel',
            category=ChecklistCategory.PRE_TRIP
        )
        self.assertEqual(str(item), 'Reserve hotel')

    def test_checklist_item_default_values(self):
        """Test default values for checklist item"""
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Default values test'
        )
        self.assertEqual(item.category, ChecklistCategory.PRE_TRIP)
        self.assertEqual(item.priority, ChecklistPriority.MEDIUM)
        self.assertFalse(item.is_completed)
        self.assertEqual(item.position, 0)


class ChecklistItemViewSetTests(APITestCase):
    """Test cases for ChecklistItemViewSet API endpoints"""

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
            destination='New York',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )

    def test_create_checklist_item(self):
        """Test creating a checklist item"""
        self.client.force_authenticate(user=self.user)
        url = reverse('checklist-item-list', kwargs={'trip_id': self.trip.id})
        data = {
            'title': 'Check passport validity',
            'description': 'Ensure passport is valid for 6 months',
            'category': ChecklistCategory.PRE_TRIP,
            'priority': ChecklistPriority.HIGH,
            'due_date': (date.today() - timedelta(days=7)).isoformat(),
            'is_completed': False,
            'assigned_to_id': str(self.trip_member.id)
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Check passport validity')

    def test_list_checklist_items(self):
        """Test listing checklist items for a trip"""
        self.client.force_authenticate(user=self.user)
        
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Item 1',
            category=ChecklistCategory.PRE_TRIP
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Item 2',
            category=ChecklistCategory.DURING_TRIP
        )
        
        url = reverse('checklist-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_checklist_item(self):
        """Test retrieving a specific checklist item"""
        self.client.force_authenticate(user=self.user)
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Get travel insurance',
            category=ChecklistCategory.PRE_TRIP
        )
        
        url = reverse('checklist-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Get travel insurance')

    def test_update_checklist_item(self):
        """Test updating a checklist item"""
        self.client.force_authenticate(user=self.user)
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Pack bags',
            category=ChecklistCategory.PRE_TRIP,
            is_completed=False
        )
        
        url = reverse('checklist-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        data = {'is_completed': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_completed'])

    def test_mark_as_complete(self):
        """Test marking a checklist item as complete"""
        self.client.force_authenticate(user=self.user)
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='Confirm reservations',
            category=ChecklistCategory.PRE_TRIP,
            is_completed=False
        )
        
        url = reverse('checklist-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        data = {'is_completed': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_completed'])
        
        item.refresh_from_db()
        self.assertTrue(item.is_completed)

    def test_delete_checklist_item(self):
        """Test deleting a checklist item"""
        self.client.force_authenticate(user=self.user)
        item = ChecklistItem.objects.create(
            trip=self.trip,
            title='To Delete',
            category=ChecklistCategory.PRE_TRIP
        )
        
        url = reverse('checklist-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ChecklistItem.objects.filter(id=item.id).exists())

    def test_filter_by_category(self):
        """Test filtering checklist items by category"""
        self.client.force_authenticate(user=self.user)
        
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Pre-trip task',
            category=ChecklistCategory.PRE_TRIP
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='During-trip task',
            category=ChecklistCategory.DURING_TRIP
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Post-trip task',
            category=ChecklistCategory.POST_TRIP
        )
        
        url = reverse('checklist-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url, {'category': ChecklistCategory.PRE_TRIP})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], ChecklistCategory.PRE_TRIP)


class ChecklistStatisticsViewTests(APITestCase):
    """Test cases for ChecklistStatisticsView API endpoint"""

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
            destination='Barcelona',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )

    def test_checklist_statistics(self):
        """Test checklist statistics endpoint"""
        self.client.force_authenticate(user=self.user)
        
        # Create items in different categories with different completion status
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Pre-trip task 1',
            category=ChecklistCategory.PRE_TRIP,
            is_completed=True
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Pre-trip task 2',
            category=ChecklistCategory.PRE_TRIP,
            is_completed=False
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='During-trip task',
            category=ChecklistCategory.DURING_TRIP,
            is_completed=True
        )
        ChecklistItem.objects.create(
            trip=self.trip,
            title='Post-trip task',
            category=ChecklistCategory.POST_TRIP,
            is_completed=False
        )
        
        url = reverse('checklist-statistics', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_items'], 4)
        self.assertEqual(response.data['completed_items'], 2)
        self.assertEqual(response.data['pending_items'], 2)
        self.assertEqual(len(response.data['category_stats']), 3)
