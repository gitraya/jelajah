# Jelajah Web App

## Overview

Jelajah is a travel planning platform that enables users to manage itineraries, expenses, trips, and packing lists. Built with Django (backend REST API) and React (frontend SPA), Jelajah helps travelers organize every aspect of their journey in a single, mobile-responsive application.

## Distinctiveness and Complexity

Unlike the social network and e-commerce projects presented in this course, Jelajah uniquely integrates multiple travel features—such as itinerary planning, expense tracking, packing management, and trip coordination—within a unified web app. The application’s complexity derives from:

- **Multi-domain data models:** Itineraries, expenses, packing lists, and trips are linked and managed with relational integrity.
- **Secure authentication:** Implements JWT-based login and registration, with unique email enforcement, secure cookies, and cross-origin security.
- **Frontend-backend integration:** The React SPA communicates with Django REST API endpoints using modern, secure patterns.
- **Responsiveness:** Mobile-first design ensures usability across devices.
- **Testing and CI/CD:** Automated tests and GitHub Actions workflows ensure code quality and reliability throughout development.
- **Distinct workflows:** Jelajah’s use-case is not covered by any previous course project. Its data relationships, custom user flows, and modular structure distinguish it from simple social or commerce sites.

## File Map

- `backend/`: Django project containing apps: `users`, `itineraries`, `expenses`, `packing`, `trips`
  - `settings.py`: Django settings and configuration
  - `urls.py`: URL routing
  - `requirements.txt`: Backend dependencies
  - `users/tests/`: Unit and API tests for user model and registration
  - `.env.dev`, `.env.prod`: Environment variable files for different setups
- `frontend/`: React SPA
  - `src/`: Source code for UI components (auth, itineraries, trips, expenses, packing)
  - `package.json`: Frontend dependencies and scripts
  - `.env.dev`, `.env.prod`: Environment variable files for different setups
- `.github/workflows/ci.yml`: GitHub Actions workflow for automated testing
- `docker-compose.yml`: Base Docker Compose configuration for development
- `docker-compose.prod.yml`: Optional Docker Compose overrides for production
- `README.md`: Project documentation (this file)

## How to Run

### Local Development (without Docker)

#### Backend

1. Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```
2. Run migrations:
   ```sh
   python backend/manage.py migrate
   ```
3. Start the server:
   ```sh
   python backend/manage.py runserver
   ```

#### Frontend

1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

### Docker Setup (Recommended, for Dev and Prod)

#### 1. Build and Start Services

```sh
docker-compose up --build
```

- This will start Django (backend), React (frontend), and Postgres (database).
- All source code changes are reflected live in the containers (volumes are mounted).

#### 2. Apply Django Migrations

```sh
docker-compose exec backend python manage.py migrate
```

#### 3. (Optional) Create Django Superuser

```sh
docker-compose exec backend python manage.py createsuperuser
```

#### 4. Access the App

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Admin Panel: [http://localhost:8000/admin](http://localhost:8000/admin)

#### 5. Environment Switching

- By default, Docker uses environment variables from `.env.dev` or `.env.prod` in `backend/` and `frontend/`.
- For production overrides, use:
  ```sh
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
  ```
- Make sure to update your `.env` files for secrets, debug toggles, database credentials, etc.

#### 6. Database Persistence

- PostgreSQL data is stored in a Docker volume (`pgdata`). This survives container restarts.

### Testing

- **Backend:**
  ```sh
  docker-compose exec backend python manage.py test
  ```
- **Frontend:**
  ```sh
  cd frontend
  npm run test
  ```

### CI/CD

- Automated tests run on every push via GitHub Actions.

## Additional Information

- All environment variables (API URLs, secrets) are managed via `.env` files in both `backend/` and `frontend/`.
- The project is fully mobile-responsive, supporting modern browsers and devices.
- If you add Python packages, update `backend/requirements.txt`.
- For deployment, configure environment variables and static file serving as needed.
- Use multiple `.env` files for different environments (dev, prod, test).

## Docker Compose Files

- `docker-compose.yml`: Main Compose file for development (default Postgres, hot reload, debug).
- `docker-compose.prod.yml`: Optional override for production (no hot reload, DEBUG=False, secure settings).

Example environment variable file for backend:

```dotenv
DB_ENGINE=django.db.backends.postgresql
DB_NAME=jelajahdb
DB_USER=jelajah
DB_PASSWORD=jelajahpass
DB_HOST=db
DB_PORT=5432
DEBUG=True
```

## Screencast

A video demonstration of all major features, including authentication, itinerary creation, expense tracking, trip management, and packing list functionality, is available on YouTube [link here].
