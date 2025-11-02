from rest_framework import viewsets, permissions
from .models import Expense, ExpenseSplit, ExpenseCategory
from .serializers import ExpenseSerializer, ExpenseSplitSerializer, ExpenseCategorySerializer
from backend.permissions import TripAccessPermission
from rest_framework.response import Response
from django.db import models
from trips.models import Trip

class ExpenseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Expense categories."""
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ExpenseViewSet(viewsets.ModelViewSet):
    """Expenses for a specific trip."""
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return Expense.objects.filter(trip_id=trip_id)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context

class ExpenseSplitViewSet(viewsets.ModelViewSet):
    """Expense splits for a specific expense."""
    serializer_class = ExpenseSplitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        expense_id = self.kwargs.get('expense_id')
        return ExpenseSplit.objects.filter(expense_id=expense_id)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['expense_id'] = self.kwargs.get('expense_id')
        return context

class ExpenseStatisticsViewSet(viewsets.ViewSet):
    """Statistics for expenses in a trip."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]

    def list(self, request, trip_id=None):
        trip = Trip.objects.filter(id=trip_id).first()
        
        trip_budget = trip.budget if trip and trip.budget else 0
        amount_spent = Expense.objects.filter(trip_id=trip_id).aggregate(total=models.Sum('amount'))['total'] or 0
        budget_remaining = trip_budget - amount_spent
        
        # list of categories with counts of expenses and total amounts
        category_stats = Expense.objects.filter(trip_id=trip_id).values('category__name', 'category__id').annotate(
            count=models.Count('id'),
            amount=models.Sum('amount')
        )
        
        # Transform the values to have nested category object
        category_stats = [
            {
                'category': {
                    'id': item['category__id'],
                    'name': item['category__name']
                },
                'count': item['count'],
                'amount': item['amount'] or 0
            }
            for item in category_stats
        ]
        

        return Response({
            "trip_budget": trip_budget,
            "amount_spent": amount_spent,
            "budget_remaining": budget_remaining,
            "category_stats": category_stats,
        })

