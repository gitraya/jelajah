from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass


class Trip(models.Model):
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    create_date = models.DateField(auto_now_add=True)
    update_date = models.DateField(auto_now=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name
