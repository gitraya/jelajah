from django.db import models
from datetime import date
from backend.models import BaseModel
from trips.models import Trip, TripMember

class ExpenseCategory(BaseModel):
    """Categories for expenses (e.g., Food, Accommodation)"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Expense Categories"

class Expense(BaseModel):
    """Expense tracking for trips"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField(default=date.today)
    paid_by = models.ForeignKey(TripMember, on_delete=models.CASCADE, related_name='expenses_paid')
    notes = models.TextField(blank=True, max_length=2000)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.title} (${self.amount})"
    
    class Meta:
        ordering = ['-date']

class ExpenseSplit(BaseModel):
    """How an expense is split between trip members"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    member = models.ForeignKey(TripMember, on_delete=models.CASCADE, related_name='expense_shares', null=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    paid = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.member.user.email}: ${self.amount}"
    
    class Meta:
        unique_together = ['expense', 'member']
