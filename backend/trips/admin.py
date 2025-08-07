from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'start_date', 'end_date', 'owner')
    search_fields = ('title', 'location')
    list_filter = ('start_date', 'is_public')
