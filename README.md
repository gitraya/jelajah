# Jelajah - Travel Planning Web Application

## Overview

Jelajah is an integrated travel planning platform that assists travelers in organizing every aspect of their travels. Built using the Django REST Framework as a backend API and React as an SPA frontend, Jelajah provides a complete solution for managing trips, itineraries, expenses, packing lists, checklists, and trip members. The application will support the ability for multiple users to join trips and collaborate on planning activities. Inspired by personal experience in having difficulty keeping track of travel plans.

**Live Demo:** [https://jelajah.raya.bio](https://jelajah.raya.bio)

---

## Distinctiveness and Complexity

### Distinctiveness

This **Jelajah Trip Planning Web Application** stands out for its **integration of collaborative trip management**, an **expense sharing system**, and a **multi-domain data architecture**. Unlike simpler applications, this project involves **several interconnected components**, from **JWT-based authentication** to **dynamic itinerary planning**, **expense tracking with payment splits**, and **role-based member management**.

One of the key differentiators of this project is its **custom user authentication model**. Many Django applications use the default `User` model, which typically relies on a username and password combination for authentication. However, in this project, I implemented a custom user model using `AbstractUser` to enable **email-based authentication**. This is a more modern approach and better reflects real-world scenarios where email is often the primary identifier for users. Furthermore, the project implements **JWT (JSON Web Token) authentication** with secure HTTP only cookies, providing production grade security against XSS attacks. The system also includes a unique **password setup flow** for users invited to a trip who don't already have an account, they receive an email invitation with a secure token to create their password.

Another key feature is the **expense sharing and management system**. Unlike projects where users can only view items or submit simple forms, this project allows users to **create expenses**, **split them among trip members**, and provides **detailed expense breakdowns for each member**. Each expense can be split among multiple members by a specific amount, and the system tracks who has paid their share. This creates an engaging user experience where users can manage shared finances and record expenses. Expenses are linked to specific trip members who have paid, ensuring accurate financial tracking and the ability to calculate balances per member.

A **collaborative trip planning system** with role-based access control further adds complexity and specificity to the application. Member management implements three distinct roles: **Organizer**, **Co-Organizer**, and **Member**, each with different permissions that affect the actions they can perform. Members can be invited via email, with both existing and new user registration flows automatically handled. A status workflow (Pending, Accepted, Declined, Blocked) ensures proper member lifecycle management. This level of **role-based interactivity** and the ability to coordinate **group trip planning** are key differentiators from basic CRUD applications.

The inclusion of **multiple planning domains** including **Itineraries**, **Expenses**, **Packing List**, and **Checklist** creates a comprehensive trip management ecosystem. These aren't just separate features, they're interconnected through trip and member relationships, allowing for task assignment to specific members, tracking completion status across categories, and aggregate statistics for a trip overview dashboard.

### Complexity

This project was complex to build for several reasons, each of which stems from the need to integrate multiple interconnected systems, manage data dynamically, and enforce business rules through code.

1. **Custom User Model with Email Authentication and JWT**:
   To support modern authentication patterns, I replaced Django’s default username-based user system with a custom user model using `AbstractUser` and `UserManager`, making email the primary login identifier. This change required updating the `USERNAME_FIELD` and ensuring all authentication flows worked smoothly with **email-based login**. For secure authentication, I integrated JWT tokens using `djangorestframework-simplejwt`, storing tokens in **HTTP only cookies** rather than localStorage to prevent XSS attacks. Custom token views (`CookieTokenObtainPairView`, `CookieTokenRefreshView`, `CookieTokenBlacklistView`) handle cookie management automatically, including secure logout via **token blacklisting**. Additionally, **rate limiting** is enforced on authentication endpoints to protect against brute-force attempts.

2. **Multi-Domain Data Architecture**:
   Managing multiple interconnected domains adds significant complexity to the application. Jelajah is organized into six dedicated Django apps, each responsible for a specific area: user management, trips and members, itineraries, expenses (with splitting), packing, and checklists. These apps are tightly integrated through the use of `ForeignKey`, `ManyToManyField`, and custom "through" models like `TripMember` and `ExpenseSplit`, allowing for rich relationships between data. The Trip model serves as the central hub, linking all other domains except for users. Each app also exposes its own statistics endpoint, which often requires aggregating and analyzing data across related models and the core Trip, enabling the generation of meaningful insights and overviews for users.

3. **Expense Splitting System**:
   The expense tracking system in Jelajah aims to provide more than just basic forms by supporting expense splitting among trip members. Each expense is associated with multiple members using the `ExpenseSplit` model, which keeps track of how much each person owes and whether they have paid. This approach helps users view individual balances, total spending by category, and outstanding payments. The backend serializer handles nested split data, including member details, and checks that the sum of all splits matches the total expense amount. It also summarizes payment status for each member. To help maintain accurate financial records, expense creation uses **atomic transactions** if any part of the process fails, the entire expense is rolled back and an error is returned, helping to ensure data integrity.

4. **RESTful API and Custom Permissions**:
   The backend exposes a REST API with nested resource routing where specific trip resources are accessed via a hierarchical URL pattern (e.g., `/api/trips/<trip_id>/itineraries/items/`, `/api/trips/<trip_id>/expenses/items/`). Access control is **custom enforced** to meet each endpoint's different needs, especially since each role member has different access rights and only certain data can be accessed publicly & only if `is_public` is enabled for that trip data.

5. **React Frontend with Multiple Context Providers**:
   This frontend demonstrates React patterns through the use of the **Context API for global state management**, implemented across nine different contexts: `AuthContext`, `TripsContext`, `TripContext`, `MembersContext`, `ItinerariesContext`, `ExpensesContext`, `ChecklistContext`, `PackingItemsContext`, and `TagsContext`. This separation of responsibilities ensures maintainable and scalable state management. Custom hooks abstract reusable logic for data fetching, authentication state, and form handling. Protected routes implement authentication aware routing with redirect handling using `react-router-dom`.

6. **Email Notification System**:
   Jelajah integrates with **SendGrid** for sending transactional emails using professionally designed HTML templates. The email system handles welcome messages upon registration, trip invitation emails with separate flows for existing users and new users requiring account creation, status change notifications, join request notifications to organizers, and password reset emails. Each email uses an HTML template stored in `backend/templates/` for consistency.

7. **DevOps and Deployment Configuration**:
   This project utilizes the DevOps practices taught in the course through **Docker containerization** with a multi-service `docker-compose.yml` that orchestrates frontend, backend, and PostgreSQL services. A **GitHub Actions workflow** automates testing on push and pull request events, while a `render.yaml` configuration enables efficient deployment to the Render cloud platform.

### Conclusion

In summary, the **Jelajah Travel Planning Web Application** aims to offer a distinctive and robust solution for group travel planning by integrating **JWT-based authentication with HTTP-only cookies**, **role-based member management**, **expense splitting with payment tracking**, and **multi-domain trip planning features**. While developing these features presented a range of challenges from implementing custom authentication flows to managing complex data relationships the process provided valuable learning opportunities. The result is a web application that strives to go beyond basic CRUD operations, supporting interactive and collaborative trip management with a focus on security and usability.

---

## File Structure

### `backend/`

Contains the Django REST Framework backend application.

- **`requirements.txt`**: Lists all Python dependencies required for the backend.

- **`Dockerfile`**: Container configuration for backend service with Python environment, dependency installation, and gunicorn server configuration.

- **`build.sh`**: Deployment build script running migrations, collectstatic, and other setup tasks for production deployment.

- **`templates/`**: Contains HTML email templates for welcome emails, trip invitations, status notifications, password reset, and set password emails. Each template uses consistent styling and branding.

### `backend/backend/`

Main Django project configuration.

- **`settings.py`**: Django configuration including database settings (PostgreSQL), JWT configuration (token lifetimes, cookie settings), CORS configuration for frontend communication, SendGrid email settings, installed apps registration, and middleware configuration.

- **`urls.py`**: Root URL routing that includes all app-specific URL patterns. Maps `/api/auth/` to user endpoints, `/api/trips/` to trip endpoints, and configures static file serving.

- **`models.py`**: Defines `BaseModel`, an abstract model providing UUID primary keys and automatic `created_at`/`updated_at` timestamps inherited by all other models in the project.

- **`permissions.py`**: Contains shared permission utilities used across multiple apps for consistent access control.

- **`services.py`**: Email service utilities including `send_email()` function that wraps SendGrid API calls and handles template rendering for all transactional emails.

### `backend/users/`

User authentication and management app.

- **`models.py`**: Defines the application's user data models:

  - **`UserManager`**: A custom manager for creating user accounts with two main methods:

    - `create_user(email, password=None, **extra_fields)`: Creates and returns a regular user with an email and password.
    - `create_superuser(email, password=None, **extra_fields)`: Creates and returns a superuser with email and password.

  - **`User`**: A custom user model that extends `AbstractUser` and `BaseModel` for email-based login.

- **`views.py`**: Authentication views including `RegisterView` for user registration with welcome email, `CookieTokenObtainPairView` for login with JWT cookie creation, `CookieTokenRefreshView` for token refresh, `CookieTokenBlacklistView` for logout, `MeView` for current user retrieval, `ProfileUpdateView` for profile editing, `SetPasswordView` for invited users to set passwords, and `ResendSetPasswordEmailView`.

- **`serializers.py`**: DRF serializers for user data: `UserSerializer` for read operations, `RegisterSerializer` with password validation and hashing, `ProfileUpdateSerializer` for partial updates, and `SetPasswordSerializer` for password setting with token validation.

- **`urls.py`**: URL patterns mapping authentication endpoints: `/register/`, `/token/`, `/token/refresh/`, `/token/blacklist/`, `/me/`, `/profile/<id>/`, `/set-password/<id>/<token>/`, `/resend-set-password-email/`.

- **`tests.py`**: Test cases covering user registration, login/logout flows, get current user.

### `backend/trips/`

Core trip management app.

- **`models.py`**: Defines the trip-related data models:

  - **`TripStatus`**: TextChoices for trip status (PLANNING, ONGOING, COMPLETED, CANCELLED, DELETED).

  - **`TripDifficulty`**: TextChoices for difficulty levels (EASY, MODERATE, CHALLENGING).

  - **`MemberStatus`**: TextChoices for member status (PENDING, ACCEPTED, DECLINED, BLOCKED).

  - **`MemberRole`**: TextChoices for member roles (ORGANIZER, CO_ORGANIZER, MEMBER).

  - **`TripMember`**: Model linking users to trips with role-based access.

  - **`Tag`**: Model for trip categorization with usage counting.

  - **`Trip`**: Main trip model for travel planning.

- **`views.py`**: `TripViewSet` handling trip CRUD with custom `join` action for join requests and `statistics` action for aggregated trip data. `TripMemberViewSet` for member management including invitation sending. `TagViewSet` for tag operations.

- **`serializers.py`**: Serializers handling nested member data, tag associations, computed fields (member count, days until trip), and validation for date ranges and member permissions.

- **`permissions.py`**: `IsTripAccessible` checking if requesting user is a trip member with appropriate status. `IsMemberAccessible` for member-specific operations based on roles.

- **`urls.py`**: Nested URL routing: `/trips/` for trip list/create, `/trips/<id>/` for trip detail, `/trips/<trip_id>/members/` for member operations.

- **`tests.py`**: Comprehensive tests for trip creation, updates, deletion, member invitations, join requests, and permission enforcement.

### `backend/itineraries/`

Itinerary planning app.

- **`models.py`**: Defines itinerary-related data models:

  - **`ItineraryType`**: Types for itinerary locations (e.g., Nature, Beach, Restaurant) which i already include the default types on migration file.

  - **`ItineraryStatus`**: TextChoices for visit status (PLANNED, VISITED, SKIPPED).

  - **`ItineraryItem`**: Individual activity or event within an itinerary.

- **`views.py`**: `ItineraryItemViewSet` with CRUD operations, `organized` action returning items grouped by date, and `statistics` action providing counts by status and type. `ItineraryTypeViewSet` for type listing.

- **`serializers.py`**: Serializers with nested type information, date formatting, and validation ensuring items belong to accessible trips.

- **`permissions.py`**: `IsItineraryItemAccessible` verifying user has access to the parent trip before allowing item operations.

- **`urls.py`**: URL patterns: `/trips/<trip_id>/itineraries/items/`, `/trips/<trip_id>/itineraries/organized/`, `/trips/<trip_id>/itineraries/statistics/`, `/itineraries/types/`.

- **`tests.py`**: Tests for itinerary creation, updates, organization by date, and statistics calculations.

### `backend/expenses/`

Expense tracking app.

- **`models.py`**: Defines expense-related data models:

  - **`ExpenseCategory`**: Categories for expenses (e.g., Food, Accommodation, Transportation) which i already include the default categories on migration file.

  - **`Expense`**: Expense tracking for trips.

  - **`ExpenseSplit`**: How an expense is split between trip members.

- **`views.py`**: `ExpenseViewSet` handling expense CRUD with automatic split creation/updates. `statistics` action calculating total expenses, per-member spending, category breakdowns, and unpaid balances. `ExpenseCategoryViewSet` for category listing.

- **`serializers.py`**: Nested serializers handling expense splits with member details, validation for split amounts matching expense total, and computed fields for payment status summaries.

- **`permissions.py`**: `IsExpenseAccessible` checking trip membership and appropriate roles for expense modifications.

- **`urls.py`**: URL patterns: `/trips/<trip_id>/expenses/items/`, `/trips/<trip_id>/expenses/statistics/`, `/expenses/categories/`.

- **`tests.py`**: Tests for expense creation with splits, and statistics accuracy.

### `backend/packing/`

Packing list app.

- **`models.py`**: Defines packing-related data models:

  - **`PackingCategory`**: Categories for packing items (e.g., Clothes, Electronics, Documents) which i already include the default categories on migration file.

  - **`PackingItem`**: Individual items to pack for a trip.

- **`views.py`**: `PackingItemViewSet` with CRUD operations and `statistics` action providing packed vs. unpacked counts, category breakdowns, and per-member assignment summaries. `PackingCategoryViewSet` for categories.

- **`serializers.py`**: Serializers with category and assignee details, validation ensuring assigned members belong to the trip.

- **`permissions.py`**: `IsPackingItemAccessible` for packing item access control based on trip membership.

- **`urls.py`**: URL patterns: `/trips/<trip_id>/packing/items/`, `/trips/<trip_id>/packing/statistics/`, `/packing/categories/`.

- **`tests.py`**: Tests for packing item operations and statistics.

### `backend/checklist/`

Checklist management app.

- **`models.py`**: Defines checklist-related data models:

  - **`ChecklistCategory`**: TextChoices for checklist phases (PRE_TRIP, DURING_TRIP, POST_TRIP).

  - **`ChecklistPriority`**: TextChoices for priority levels (LOW, MEDIUM, HIGH).

  - **`ChecklistItem`**: Model representing a checklist item for a trip.

- **`views.py`**: `ChecklistItemViewSet` with CRUD and `statistics` action providing completion rates by phase and priority, overdue item counts, and assignment summaries.

- **`serializers.py`**: Serializers with computed fields for overdue status, validation for due dates and assignee membership.

- **`permissions.py`**: `IsChecklistItemAccessible` enforcing trip membership for checklist operations.

- **`urls.py`**: URL patterns: `/trips/<trip_id>/checklist/items/`, `/trips/<trip_id>/checklist/statistics/`.

- **`tests.py`**: Tests for checklist item lifecycle and statistics calculations.

### `frontend/`

Contains the React single-page application.

- **`Dockerfile`**: Container configuration for frontend service with Node.js environment.

- **`src/`**: Main source code directory containing:

  - **`App.jsx`**: Main application component setting up React Router, context providers, and route definitions.
  - **`index.css`**: Global CSS styles including CSS custom properties, reset styles, and utility classes.

  - **`pages/`**: Page components:

    - **`Home.jsx`**: Landing page displaying public trips with search and filtering.
    - **`MyTrips.jsx`**: Authenticated user's trip dashboard.
    - **`TripDetail.jsx`**: Public trip view with join request functionality.
    - **`TripManage.jsx`**: Trip management dashboard with tabbed interface.
    - **`NotFound.jsx`**: 404 error page.
    - **`auth/Login.jsx`**: Login form with validation and error handling.
    - **`auth/Register.jsx`**: Registration form with password validation.
    - **`auth/SetPassword.jsx`**: Password setting form for invited users.
    - **`auth/ResendSetPasswordEmail. jsx`**: Form to request new set-password email.

  - **`components/`**: Reusable UI components:

    - **`TripOverview.jsx`**: Trip summary dashboard with statistics.
    - **`ItinerariesManager.jsx`**: Itinerary management interface.
    - **`ExpensesManager.jsx`**: Expense tracking with split configuration.
    - **`MembersManager.jsx`**: Member management with role controls.
    - **`PackingList.jsx`**: Packing list with progress indicators.
    - **`ChecklistManager.jsx`**: Checklist with phase-based organization.
    - **`UserAvatar.jsx`**: User profile avatar component.
    - **`ui/`**: Base UI components (buttons, inputs, modals, cards).
    - **`dialogs/`**: Modal dialog components for forms and confirmations.
    - **`layouts/`**: Page layout components (header, navigation, footer).

  - **`contexts/`**: React Context providers for state management:

    - **`AuthContext.jsx`**: Authentication state and functions.
    - **`TripsContext.jsx`**: Trip list state management.
    - **`TripContext.jsx`**: Single trip state management.
    - **`MembersContext.jsx`**: Trip members state.
    - **`ItinerariesContext.jsx`**: Itinerary state.
    - **`ExpensesContext.jsx`**: Expense state with splits.
    - **`ChecklistContext.jsx`**: Checklist state.
    - **`PackingItemsContext.jsx`**: Packing items state.
    - **`TagsContext.jsx`**: Tags state.

  - **`hooks/`**: Custom React hooks for reusable logic.

  - **`configs/`**: Configuration files including API endpoint URLs.

  - **`lib/`**: Utility functions for date formatting, validation, and API wrappers.

### Root Directory

- **`.github/workflows/`**: GitHub Actions CI/CD workflows:

  - **`backend. yml`**: Backend workflow running Django tests on push/PR.
  - **`frontend.yml`**: Frontend workflow running linting and tests.

- **`docker-compose.yml`**: Docker Compose configuration defining three services: `frontend` (React on port 5173), `backend` (Django on port 8000), and `db` (PostgreSQL with persistent volume).

- **`render.yaml`**: Render platform deployment configuration for cloud deployment.

---

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 22+
- npm or yarn
- PostgreSQL (or Docker)
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gitraya/jelajah.git
   cd jelajah
   ```

2. **Create environment files:**

   Create `backend/.env`:

   ```dotenv
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=jelajahdb
   DB_USER=jelajah
   DB_PASSWORD=jelajahpass
   DB_HOST=db
   DB_PORT=5432
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   SENDGRID_API_KEY=your-sendgrid-api-key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

   Create `frontend/.env`:

   ```dotenv
   VITE_BACKEND_URL=http://localhost:8000/api
   PORT=5173
   ```

   Note: Leave empty SENDGRID_API_KEY if you don't have one for local testing.

3. **Build and start services:**

   ```bash
   docker-compose up --build
   ```

4. **Apply database migrations:**

   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create a superuser (optional):**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

### Option 2: Local Development (Without Docker)

#### Backend Setup

1. **Create and activate virtual environment:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   Create `backend/.env`

   ```dotenv
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   SENDGRID_API_KEY=your-sendgrid-api-key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

   Note: Leave empty SENDGRID_API_KEY if you don't have one for local testing.

4. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

5. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**

   Create `frontend/.env`:

   ```dotenv
   VITE_BACKEND_URL=http://localhost:8000/api
   PORT=5173
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Running Tests

**Backend Tests:**

```bash
# With Docker
docker-compose exec backend python manage.py test

# Without Docker
cd backend
python manage.py test
```

**Frontend Tests:**

```bash
cd frontend
npm run test
```

---

## API Endpoints

### Authentication

| Method | Endpoint                                    | Description               |
| ------ | ------------------------------------------- | ------------------------- |
| POST   | `/api/auth/register/`                       | Register new user         |
| POST   | `/api/auth/token/`                          | Login (JWT token)         |
| POST   | `/api/auth/token/blacklist/`                | Logout (blacklist token)  |
| POST   | `/api/auth/token/refresh/`                  | Refresh access token      |
| GET    | `/api/auth/me/`                             | Get current user          |
| PUT    | `/api/auth/profile/<user_id>/`              | Update current user       |
| POST   | `/api/auth/set-password/<user_id>/<token>/` | Set password              |
| POST   | `/api/auth/resend-set-password-email/`      | Resend set password email |

### Trips

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| GET    | `/api/trips/`            | List trips (public or user's) |
| POST   | `/api/trips/`            | Create new trip               |
| GET    | `/api/trips/<id>/`       | Get trip details              |
| PUT    | `/api/trips/<id>/`       | Update trip                   |
| DELETE | `/api/trips/<id>/`       | Delete trip (soft delete)     |
| POST   | `/api/trips/<id>/join/`  | Request to join trip          |
| GET    | `/api/trips/statistics/` | Get overall trip statistics   |

### Trip Members

| Method | Endpoint                                   | Description                 |
| ------ | ------------------------------------------ | --------------------------- |
| GET    | `/api/trips/<trip_id>/members/`            | List trip members           |
| POST   | `/api/trips/<trip_id>/members/`            | Add member to trip          |
| PUT    | `/api/trips/<trip_id>/members/<id>/`       | Update member (role/status) |
| DELETE | `/api/trips/<trip_id>/members/<id>/`       | Remove member               |
| GET    | `/api/trips/<trip_id>/members/statistics/` | Member statistics           |

### Itineraries

| Method | Endpoint                                       | Description           |
| ------ | ---------------------------------------------- | --------------------- |
| GET    | `/api/trips/<trip_id>/itineraries/items/`      | List itinerary items  |
| POST   | `/api/trips/<trip_id>/itineraries/items/`      | Create itinerary item |
| PUT    | `/api/trips/<trip_id>/itineraries/items/<id>/` | Update itinerary      |
| DELETE | `/api/trips/<trip_id>/itineraries/items/<id>/` | Delete itinerary      |
| GET    | `/api/trips/<trip_id>/itineraries/organized/`  | Organized itineraries |
| GET    | `/api/trips/<trip_id>/itineraries/statistics/` | Itinerary statistics  |
| GET    | `/api/itineraries/types/`                      | List itinerary types  |

### Expenses

| Method | Endpoint                                    | Description             |
| ------ | ------------------------------------------- | ----------------------- |
| GET    | `/api/trips/<trip_id>/expenses/items/`      | List expenses           |
| POST   | `/api/trips/<trip_id>/expenses/items/`      | Create expense          |
| PUT    | `/api/trips/<trip_id>/expenses/items/<id>/` | Update expense          |
| DELETE | `/api/trips/<trip_id>/expenses/items/<id>/` | Delete expense          |
| GET    | `/api/trips/<trip_id>/expenses/statistics/` | Expense statistics      |
| GET    | `/api/expenses/categories/`                 | List expense categories |

### Packing

| Method | Endpoint                                   | Description             |
| ------ | ------------------------------------------ | ----------------------- |
| GET    | `/api/trips/<trip_id>/packing/items/`      | List packing items      |
| POST   | `/api/trips/<trip_id>/packing/items/`      | Create packing item     |
| PUT    | `/api/trips/<trip_id>/packing/items/<id>/` | Update packing item     |
| DELETE | `/api/trips/<trip_id>/packing/items/<id>/` | Delete packing item     |
| GET    | `/api/trips/<trip_id>/packing/statistics/` | Packing statistics      |
| GET    | `/api/packing/categories/`                 | List packing categories |

### Checklist

| Method | Endpoint                                     | Description           |
| ------ | -------------------------------------------- | --------------------- |
| GET    | `/api/trips/<trip_id>/checklist/items/`      | List checklist items  |
| POST   | `/api/trips/<trip_id>/checklist/items/`      | Create checklist item |
| PUT    | `/api/trips/<trip_id>/checklist/items/<id>/` | Update checklist item |
| DELETE | `/api/trips/<trip_id>/checklist/items/<id>/` | Delete checklist item |
| GET    | `/api/trips/<trip_id>/checklist/statistics/` | Checklist statistics  |

---

## Additional Information

### Technologies Used

**Backend:**

- Django 5.2.4
- Django REST Framework 3.16.0
- djangorestframework-simplejwt 5.5.1 (JWT Authentication)
- django-cors-headers 4.7.0 (CORS handling)
- pillow (Image handling)
- psycopg2-binary (PostgreSQL adapter)
- SendGrid (Email delivery)
- Gunicorn (WSGI server)
- WhiteNoise (Static files)

**Frontend:**

- React 18+ with Vite
- React Router (Client-side routing)
- Context API (State management)
- Tailwind CSS (Utility-first CSS framework)

**DevOps:**

- Docker & Docker Compose
- PostgreSQL
- GitHub Actions (CI/CD)
- Render (Cloud deployment)

### Security Elements

- JWT tokens are kept in HTTP-only cookies to stop cross-site scripting attacks.
- Cross-origin request CORS configuration
- Rate limiting on authentication endpoints
- Token blacklisting upon logout
- Password hashing using Django's built-in mechanism
- Role-based trip resource access control
- Input validation on both frontend and backend

---

## Future Improvements

- Pagination for list endpoints
- Real-time collaboration using WebSockets
- Trip photo galleries
- Integration with maps API for itinerary visualization
- Export trips to PDF
- Push notifications for trip updates
- Calendar synchronization

---

## Author

**gitraya** - [GitHub Profile](https://github.com/gitraya)

---

## License

This project was created as part of CS50's Web Programming with Python and JavaScript course.
