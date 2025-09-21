from django.contrib.auth.models import AbstractUser
from django.db import models
from backend.models import BaseModel

class User(AbstractUser, BaseModel):
    """Extended user model for Jelajah"""
    username = None  # Remove username field
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    email = models.EmailField(unique=True, max_length=255)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remove 'username' from required fields

    def __str__(self):
        return self.email
