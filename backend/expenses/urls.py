from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ExpenseSplitViewSet

# Nested routers for trip -> expenses -> splits
expenses_router = DefaultRouter()
expenses_router.register(r'expenses', ExpenseViewSet, basename='expense')

splits_router = DefaultRouter()
splits_router.register(r'splits', ExpenseSplitViewSet, basename='expense-split')

urlpatterns = [
    path('trips/<int:trip_id>/', include(expenses_router.urls)),
    path('expenses/<int:expense_id>/', include(splits_router.urls)),
]
