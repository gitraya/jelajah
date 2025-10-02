from django.contrib import admin
from .models import PackingCategory, PackingItem

admin.site.register(PackingCategory)
admin.site.register(PackingItem)
