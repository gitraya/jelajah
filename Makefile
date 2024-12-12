dev:
	python manage.py runserver
css:
	npx tailwindcss -i ./jelajah/static/jelajah/input.css -o ./jelajah/static/jelajah/output.css --watch
