from django.db import migrations

def load_expense_categories(apps, schema_editor):
    ExpenseCategory = apps.get_model('expenses', 'ExpenseCategory')
    categories = [
        'Accommodation',
        'Transportation',
        'Food & Dining',
        'Activities & Entertainment',
        'Shopping',
        'Health & Wellness',
        'Travel Insurance',
        'Other',
    ]
    for category_name in categories:
        ExpenseCategory.objects.create(name=category_name)


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0005_alter_expense_date'),
    ]

    operations = [
        migrations.RunPython(load_expense_categories),
    ]
