from rest_framework import viewsets, permissions
from .models import Expense, ExpenseSplit
from .serializers import ExpenseSerializer, ExpenseDetailSerializer, ExpenseSplitSerializer
from trips.models import Trip
from django.db import models

class TripAccessPermission(permissions.BasePermission):
    """Permission to only allow trip members or owners to access expenses"""
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        user = request.user
        return Trip.objects.filter(
            id=trip_id
        ).filter(
            models.Q(owner=user) | models.Q(members=user)
        ).exists()

class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return Expense.objects.filter(trip_id=trip_id).order_by('-date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return ExpenseDetailSerializer
        return ExpenseSerializer

class ExpenseSplitViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSplitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        expense_id = self.kwargs.get('expense_id')
        return ExpenseSplit.objects.filter(expense_id=expense_id)
    
    def perform_create(self, serializer):
        expense_id = self.kwargs.get('expense_id')
        serializer.save(expense_id=expense_id)
