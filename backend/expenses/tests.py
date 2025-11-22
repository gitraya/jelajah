from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from datetime import date, timedelta
from .models import Expense, ExpenseSplit, ExpenseCategory
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ExpenseModelTests(TestCase):
    """Test cases for Expense model"""

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
        self.category = ExpenseCategory.objects.create(name='Food')

    def test_create_expense(self):
        """Test creating an expense"""
        expense = Expense.objects.create(
            trip=self.trip,
            title='Lunch',
            amount=Decimal('50.00'),
            date=date.today(),
            paid_by=self.trip_member,
            category=self.category
        )
        self.assertEqual(expense.title, 'Lunch')
        self.assertEqual(expense.amount, Decimal('50.00'))
        self.assertEqual(expense.paid_by, self.trip_member)
        self.assertEqual(expense.category, self.category)

    def test_expense_str_representation(self):
        """Test string representation of Expense"""
        expense = Expense.objects.create(
            trip=self.trip,
            title='Hotel',
            amount=Decimal('200.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        self.assertEqual(str(expense), 'Hotel ($200.00)')


class ExpenseSplitModelTests(TestCase):
    """Test cases for ExpenseSplit model"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123',
            first_name='User',
            last_name='One'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123',
            first_name='User',
            last_name='Two'
        )
        self.trip = Trip.objects.create(
            owner=self.user1,
            title='Test Trip',
            destination='Rome',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5)
        )
        self.member1 = TripMember.objects.create(
            trip=self.trip,
            user=self.user1,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.member2 = TripMember.objects.create(
            trip=self.trip,
            user=self.user2,
            role=MemberRole.MEMBER,
            status=MemberStatus.ACCEPTED
        )
        self.category = ExpenseCategory.objects.create(name='Transportation')
        self.expense = Expense.objects.create(
            trip=self.trip,
            title='Taxi',
            amount=Decimal('100.00'),
            paid_by=self.member1,
            category=self.category
        )

    def test_create_expense_split(self):
        """Test creating an expense split"""
        split = ExpenseSplit.objects.create(
            expense=self.expense,
            member=self.member1,
            amount=Decimal('50.00'),
            paid=True
        )
        self.assertEqual(split.expense, self.expense)
        self.assertEqual(split.member, self.member1)
        self.assertEqual(split.amount, Decimal('50.00'))
        self.assertTrue(split.paid)

    def test_expense_split_str_representation(self):
        """Test string representation of ExpenseSplit"""
        split = ExpenseSplit.objects.create(
            expense=self.expense,
            member=self.member2,
            amount=Decimal('50.00'),
            paid=False
        )
        expected_str = f"{self.user2.email}: $50.00"
        self.assertEqual(str(split), expected_str)


class ExpenseViewSetTests(APITestCase):
    """Test cases for ExpenseViewSet API endpoints"""

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
            destination='Berlin',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5),
            budget=Decimal('1000.00')
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.category = ExpenseCategory.objects.create(name='Accommodation')

    def test_create_expense_with_splits(self):
        """Test creating an expense with splits"""
        self.client.force_authenticate(user=self.user)
        url = reverse('expense-item-list', kwargs={'trip_id': self.trip.id})
        data = {
            'title': 'Hotel Room',
            'amount': '200.00',
            'date': date.today().isoformat(),
            'paid_by_id': str(self.trip_member.id),
            'category_id': str(self.category.id),
            'notes': 'Two nights',
            'splits': [
                {
                    'member_id': str(self.trip_member.id),
                    'amount': '200.00',
                    'paid': True
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Hotel Room')
        self.assertEqual(len(response.data['splits']), 1)

    def test_create_expense_invalid_split_total(self):
        """Test that expense creation fails if splits don't sum to total"""
        self.client.force_authenticate(user=self.user)
        url = reverse('expense-item-list', kwargs={'trip_id': self.trip.id})
        data = {
            'title': 'Invalid Expense',
            'amount': '100.00',
            'date': date.today().isoformat(),
            'paid_by_id': str(self.trip_member.id),
            'category_id': str(self.category.id),
            'splits': [
                {
                    'member_id': str(self.trip_member.id),
                    'amount': '50.00',  # Doesn't match total
                    'paid': True
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_expenses_for_trip(self):
        """Test listing expenses for a trip"""
        self.client.force_authenticate(user=self.user)
        
        # Create some expenses
        expense1 = Expense.objects.create(
            trip=self.trip,
            title='Breakfast',
            amount=Decimal('30.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        expense2 = Expense.objects.create(
            trip=self.trip,
            title='Dinner',
            amount=Decimal('80.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        
        url = reverse('expense-item-list', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_expense(self):
        """Test retrieving a specific expense"""
        self.client.force_authenticate(user=self.user)
        expense = Expense.objects.create(
            trip=self.trip,
            title='Museum Ticket',
            amount=Decimal('25.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        
        url = reverse('expense-item-detail', kwargs={'trip_id': self.trip.id, 'pk': expense.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Museum Ticket')

    def test_update_expense(self):
        """Test updating an expense"""
        self.client.force_authenticate(user=self.user)
        expense = Expense.objects.create(
            trip=self.trip,
            title='Original Title',
            amount=Decimal('50.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        ExpenseSplit.objects.create(
            expense=expense,
            member=self.trip_member,
            amount=Decimal('50.00'),
            paid=True
        )
        
        url = reverse('expense-item-detail', kwargs={'trip_id': self.trip.id, 'pk': expense.id})
        data = {
            'title': 'Updated Title',
            'amount': '75.00',
            'paid_by_id': str(self.trip_member.id),
            'category_id': str(self.category.id),
            'splits': [
                {
                    'member_id': str(self.trip_member.id),
                    'amount': '75.00',
                    'paid': True
                }
            ]
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_delete_expense(self):
        """Test deleting an expense"""
        self.client.force_authenticate(user=self.user)
        expense = Expense.objects.create(
            trip=self.trip,
            title='To Delete',
            amount=Decimal('20.00'),
            paid_by=self.trip_member,
            category=self.category
        )
        
        url = reverse('expense-item-detail', kwargs={'trip_id': self.trip.id, 'pk': expense.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=expense.id).exists())


class ExpenseStatisticsViewTests(APITestCase):
    """Test cases for ExpenseStatisticsView API endpoint"""

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
            destination='Madrid',
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=5),
            budget=Decimal('1000.00')
        )
        self.trip_member = TripMember.objects.create(
            trip=self.trip,
            user=self.user,
            role=MemberRole.ORGANIZER,
            status=MemberStatus.ACCEPTED
        )
        self.category1 = ExpenseCategory.objects.create(name='Food')
        self.category2 = ExpenseCategory.objects.create(name='Transport')

    def test_expense_statistics(self):
        """Test expense statistics endpoint"""
        self.client.force_authenticate(user=self.user)
        
        # Create expenses in different categories
        Expense.objects.create(
            trip=self.trip,
            title='Lunch',
            amount=Decimal('100.00'),
            paid_by=self.trip_member,
            category=self.category1
        )
        Expense.objects.create(
            trip=self.trip,
            title='Dinner',
            amount=Decimal('150.00'),
            paid_by=self.trip_member,
            category=self.category1
        )
        Expense.objects.create(
            trip=self.trip,
            title='Taxi',
            amount=Decimal('50.00'),
            paid_by=self.trip_member,
            category=self.category2
        )
        
        url = reverse('expense-statistics', kwargs={'trip_id': self.trip.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['trip_budget'], Decimal('1000.00'))
        self.assertEqual(response.data['amount_spent'], Decimal('300.00'))
        self.assertEqual(response.data['budget_remaining'], Decimal('700.00'))
        self.assertEqual(len(response.data['category_stats']), 2)


class ExpenseCategoryViewSetTests(APITestCase):
    """Test cases for ExpenseCategoryViewSet API endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_list_expense_categories(self):
        """Test listing expense categories"""
        self.client.force_authenticate(user=self.user)
        
        ExpenseCategory.objects.create(name='Food')
        ExpenseCategory.objects.create(name='Accommodation')
        
        url = reverse('expense-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
