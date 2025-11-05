from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ExpenseSplitViewSet, ExpenseCategoryViewSet, ExpenseStatisticsView

router = DefaultRouter()
router.register(r'expenses/categories', ExpenseCategoryViewSet, basename='expense-category')

trip_router = DefaultRouter()
trip_router.register(r'items', ExpenseViewSet, basename='expense-item')

splits_router = DefaultRouter()
splits_router.register(r'splits', ExpenseSplitViewSet, basename='expense-split')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/expenses/', include(trip_router.urls)),
    path('trips/<uuid:trip_id>/expenses/statistics/', ExpenseStatisticsView.as_view(), name='expense-statistics'),
    path('expenses/<uuid:expense_id>/', include(splits_router.urls)),
    
]
