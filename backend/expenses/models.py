from django.db import models
from django.conf import settings
from backend.models import BaseModel

class Expense(BaseModel):
    """Expense tracking for trips"""
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses_paid')
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.title} (${self.amount})"
    
    class Meta:
        ordering = ['-date']

class ExpenseSplit(BaseModel):
    """How an expense is split between trip members"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_shares')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username}: ${self.amount}"
    
    class Meta:
        unique_together = ['expense', 'user']
