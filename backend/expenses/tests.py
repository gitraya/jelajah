from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal
from django.urls import reverse

from .models import Expense, ExpenseCategory, ExpenseSplit
from trips.models import Trip, TripMember, MemberRole, MemberStatus

User = get_user_model()


class ExpenseModelTests(TestCase):
    """Model tests for Expense and ExpenseSplit"""

    def setUp(self):
        self.user = User.objects.create_user(email="expuser@example.com", password="testpass123")
        self.trip = Trip.objects.create(
            owner=self.user,
            title="Expense Trip",
            destination="X",
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
        )
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)
        self.category = ExpenseCategory.objects.create(name="Food")

    def test_create_expense_and_split(self):
        expense = Expense.objects.create(trip=self.trip, title="Dinner", amount=Decimal("1500000.00"), paid_by=self.member, category=self.category)
        split = ExpenseSplit.objects.create(expense=expense, member=self.member, amount=Decimal("1500000.00"))
        self.assertEqual(expense.splits.count(), 1)
        self.assertIn(split, expense.splits.all())


class ExpenseAPITests(APITestCase):
    """API tests for expenses"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="api_exp@example.com", password="testpass123")
        self.trip = Trip.objects.create(
            owner=self.user,
            title="API Expense Trip",
            destination="Y",
            start_date=date.today() + timedelta(days=6),
            end_date=date.today() + timedelta(days=9),
            budget=Decimal("15000000.00"),
        )
        self.member = TripMember.objects.create(trip=self.trip, user=self.user, role=MemberRole.ORGANIZER, status=MemberStatus.ACCEPTED)
        self.category = ExpenseCategory.objects.create(name="Places to Stay")
        self.client.force_authenticate(user=self.user)

    def test_create_expense_with_splits(self):
        data = {
            "title": "Hotel",
            "amount": "3000000.00",
            "paid_by_id": str(self.member.id),
            "category_id": str(self.category.id),
            "splits": [
                {"member_id": str(self.member.id), "amount": "3000000.00", "paid": True}
            ]
        }
        resp = self.client.post(reverse("expense-item-list", kwargs={"trip_id": self.trip.id}), data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 1)
        self.assertEqual(Expense.objects.get().splits.count(), 1)

    def test_list_expenses_and_statistics(self):
        Expense.objects.create(trip=self.trip, title="E1", amount=Decimal("750000.00"), paid_by=self.member, category=self.category)
        Expense.objects.create(trip=self.trip, title="E2", amount=Decimal("2250000.00"), paid_by=self.member, category=self.category)
        resp = self.client.get(reverse("expense-item-list", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)

        resp = self.client.get(reverse("expense-statistics", kwargs={"trip_id": self.trip.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("trip_budget", resp.data)
        self.assertIn("amount_spent", resp.data)
