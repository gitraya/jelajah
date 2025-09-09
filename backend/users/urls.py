from django.urls import path
from .views import RegisterView, UserDetailView, UserProfileView, CookieTokenObtainPairView, CookieTokenRefreshView, CookieTokenBlacklistView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('token/blacklist/', CookieTokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user_profile'),
    path('users/', UserListView.as_view(), name='user_list')
]
