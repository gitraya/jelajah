import os
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserDetailSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'
    permission_classes = [permissions.IsAuthenticated]


class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.set_cookie(
                key='token',
                value=','.join([response.data['access'], response.data['refresh']]),
                httponly=True,
                secure=True,
                samesite='Strict' if os.getenv('DJANGO_ENV') == "production" else 'None',
                max_age=3600 * 24 * 7  # 1 week
            )
            response.data = {'message': 'Login successful'}
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.set_cookie(
                key='access_token',
                value=','.join([response.data['access'], response.data['refresh']]),
                httponly=True,
                secure=True,
                samesite='Strict' if os.getenv('DJANGO_ENV') == "production" else 'None',
                max_age=3600 * 24 * 7  # 1 week
            )
            response.data = {'message': 'Token refreshed successfully'}
        return response
