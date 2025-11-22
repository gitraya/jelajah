from django.db import migrations

def load_packing_categories(apps, schema_editor):
    PackingCategory = apps.get_model('packing', 'PackingCategory')
    categories = [
        'Documents',
        'Clothing',
        'Toiletries',
        'Electronics',
        'Beach Gear',
        'Hiking Gear',
        'Medical Supplies',
        'Snacks',
        'Entertainment',
        'Footwear',
        'Weather-Specific Items',
        'Safety Items',
        'Travel Accessories',
        'Souvenirs',
        'Camping Gear',
        'Other',
    ]
    for category_name in categories:
        PackingCategory.objects.create(name=category_name)


class Migration(migrations.Migration):

    dependencies = [
        ('packing', '0005_alter_packingitem_options'),
    ]

    operations = [
        migrations.RunPython(load_packing_categories),
    ]
