from django.db import migrations

def load_itinerary_types(apps, schema_editor):
    ItineraryType = apps.get_model('itineraries', 'ItineraryType')
    types = [
        'Cultural',
        'Nature',
        'Beach',
        'Restaurant',
        'Shopping',
        'Activity',
        'Other'
    ]
    for type_name in types:
        ItineraryType.objects.create(name=type_name)


class Migration(migrations.Migration):

    dependencies = [
        ('itineraries', '0002_alter_itineraryitem_estimated_time'),
    ]

    operations = [
        migrations.RunPython(load_itinerary_types),
    ]
