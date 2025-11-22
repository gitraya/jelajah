from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from datetime import date, timedelta
from .models import PackingItem, PackingCategory
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class PackingItemModelTests(TestCase):
    """Test cases for PackingItem model"""

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
            destination='Hawaii',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.category = PackingCategory.objects.create(name='Clothing')

    def test_create_packing_item(self):
        """Test creating a packing item"""
        item = PackingItem.objects.create(
            trip=self.trip,
            name='T-Shirts',
            category=self.category,
            quantity=5,
            packed=False,
            assigned_to=self.trip_member
        )
        self.assertEqual(item.name, 'T-Shirts')
        self.assertEqual(item.quantity, 5)
        self.assertFalse(item.packed)
        self.assertEqual(item.category, self.category)

    def test_packing_item_str_representation(self):
        """Test string representation of PackingItem"""
        item = PackingItem.objects.create(
            trip=self.trip,
            name='Sunscreen',
            category=self.category
        )
        self.assertEqual(str(item), 'Sunscreen')

    def test_packing_item_default_quantity(self):
        """Test default quantity is 1"""
        item = PackingItem.objects.create(
            trip=self.trip,
            name='Passport',
            category=self.category
        )
        self.assertEqual(item.quantity, 1)


class PackingItemViewSetTests(APITestCase):
    """Test cases for PackingItemViewSet API endpoints"""

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
            destination='Bali',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.category = PackingCategory.objects.create(name='Electronics')

    def test_create_packing_item(self):
        """Test creating a packing item"""
        self.client.force_authenticate(user=self.user)
        url = reverse('packing-item-list', kwargs={'trip_id': self.trip.id})
        data = {
            'name': 'Camera',
            'category': str(self.category.id),
            'quantity': 1,
            'packed': False,
            'assigned_to': str(self.trip_member.id)
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Camera')

    def test_list_packing_items(self):
        """Test listing packing items for a trip"""
        self.client.force_authenticate(user=self.user)
        
        PackingItem.objects.create(
            trip=self.trip,
            name='Charger',
            category=self.category
        )
        PackingItem.objects.create(
            trip=self.trip,
            name='Laptop',
            category=self.category
        )
        
        url = reverse('packing-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_packing_item(self):
        """Test retrieving a specific packing item"""
        self.client.force_authenticate(user=self.user)
        item = PackingItem.objects.create(
            trip=self.trip,
            name='Phone',
            category=self.category
        )
        
        url = reverse('packing-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Phone')

    def test_update_packing_item(self):
        """Test updating a packing item"""
        self.client.force_authenticate(user=self.user)
        item = PackingItem.objects.create(
            trip=self.trip,
            name='Headphones',
            category=self.category,
            packed=False
        )
        
        url = reverse('packing-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        data = {'packed': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['packed'])

    def test_mark_as_packed(self):
        """Test marking an item as packed"""
        self.client.force_authenticate(user=self.user)
        item = PackingItem.objects.create(
            trip=self.trip,
            name='Shoes',
            category=self.category,
            packed=False
        )
        
        url = reverse('packing-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        data = {'packed': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['packed'])
        
        item.refresh_from_db()
        self.assertTrue(item.packed)

    def test_delete_packing_item(self):
        """Test deleting a packing item"""
        self.client.force_authenticate(user=self.user)
        item = PackingItem.objects.create(
            trip=self.trip,
            name='To Delete',
            category=self.category
        )
        
        url = reverse('packing-item-detail', kwargs={'trip_id': self.trip.id, 'pk': item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PackingItem.objects.filter(id=item.id).exists())

    def test_filter_by_category(self):
        """Test filtering packing items by category"""
        self.client.force_authenticate(user=self.user)
        
        category2 = PackingCategory.objects.create(name='Toiletries')
        
        PackingItem.objects.create(
            trip=self.trip,
            name='Phone Charger',
            category=self.category
        )
        PackingItem.objects.create(
            trip=self.trip,
            name='Toothbrush',
            category=category2
        )
        
        url = reverse('packing-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url, {'category_id': str(self.category.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Phone Charger')


class PackingItemStatisticsViewTests(APITestCase):
    """Test cases for PackingItemStatisticsView API endpoint"""

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
            destination='Singapore',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.category1 = PackingCategory.objects.create(name='Clothes')
        self.category2 = PackingCategory.objects.create(name='Documents')

    def test_packing_statistics(self):
        """Test packing statistics endpoint"""
        self.client.force_authenticate(user=self.user)
        
        # Create items in different categories with different packed status
        PackingItem.objects.create(
            trip=self.trip,
            name='Shirt 1',
            category=self.category1,
            packed=True
        )
        PackingItem.objects.create(
            trip=self.trip,
            name='Shirt 2',
            category=self.category1,
            packed=False
        )
        PackingItem.objects.create(
            trip=self.trip,
            name='Passport',
            category=self.category2,
            packed=True
        )
        
        url = reverse('packing-statistics', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_items'], 3)
        self.assertEqual(response.data['packed_items'], 2)
        self.assertEqual(response.data['unpacked_items'], 1)
        self.assertEqual(len(response.data['category_stats']), 2)
