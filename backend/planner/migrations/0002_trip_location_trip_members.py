# Generated by Django 5.2.4 on 2025-07-28 17:04

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='location',
            field=models.CharField(default='Bekasi', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='trip',
            name='members',
            field=models.ManyToManyField(blank=True, related_name='trip_members', to=settings.AUTH_USER_MODEL),
        ),
    ]
