"""
Django migrations package for the 'backend' app.

This directory serves as a Python package for Django migrations. The backend app
defines BaseModel (an abstract model) in backend/backend/models.py, so no actual
database tables are created from this app's models.

The .sql files in this directory (expenses.sql, itineraries.sql, packing.sql)
contain manual data insertion scripts for seeding default categories and are
intentionally kept here for reference. These should be applied manually or moved
to a dedicated SQL directory in the future.
"""
