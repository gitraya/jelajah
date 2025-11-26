# Jelajah - Travel Planning Web Application

## Overview

Jelajah is an integrated travel planning platform that assists travelers in organizing every aspect of their travels. Built using the Django REST Framework as a backend API and React as an SPA frontend, Jelajah provides a complete solution for managing trips, itineraries, expenses, packing lists, checklists, and trip members. The application will support the ability for multiple users to join trips and collaborate on planning activities. Inspired by personal experience in having difficulty keeping track of travel plans.

**Live Demo:** [https://jelajah.raya.bio](https://jelajah.raya.bio)

**Screencast:** [Add your YouTube video link here]

---

## Distinctiveness and Complexity

### Why This Project is Distinct

As a concept and in its implementation, Jelajah is very different from the other projects in CS50W:

1. **Not a Social Network (Project 4):** Even though Jelajah implements user accounts and allows multiple users to go on trips together, the core functionality is **trip planning and management**, not social interaction. There are no posts, likes, followers, or feeds. The user relationships exist solely in the context of trip membership, where users collaborate on logistics, rather than social networking activities.

2. **Not an E-commerce Site (Project 2):** Jelajah is not an e-commerce site; it does not sell products. There are no shopping carts, product listings, payment processing, or order management in it. The expense tracking feature allows **recording and splitting costs among trip members only**, which is far from commercial in nature. The users will track what they spent during the trips, not buying items through the system.

3. **Not a Wiki or Mail Application (Projects 1 & 3):** Unlike the Wiki project, Jelajah does not focus on content creation and editing using markdown. Unlike the Mail project, this project is also not about sending and receiving messages. Instead, Jelajah will be a **domain-specific planning tool** with complex relational data models.

### Technical Complexity

In several key areas, Jelajah is much more complex when compared to the course projects:

#### 1. Multi-Domain Data Architecture (11+ Django Models)

The system Jelajah implements an advanced data model with several interlinked entities:

- **User Management:** Custom `User` model that inherits from `AbstractUser`, with email-based authentication, and a custom `UserManager`.
- **Trip System:** `Trip` model with complex fields- Status Tracking: can be planned, ongoing, completed, or cancelled, and can be deleted; Difficulty Level; Budget Management; Public/Private Visibility Settings; Joinability Settings
- **Member Management:** `TripMember` model; Role-based access: Organizer, Co-Organizer, Member; Status Workflow: Pending, Accepted, Declined, Blocked; Emergency contact information
- **Itinerary Planning:** `ItineraryItem` - supports future geolocation (latitude/longitude), the ability to schedule visits, track the status of each visit (Planned, Visited, Skipped), and `ItineraryType` categorization
- **Expense Tracking:** `Expense` model with `ExpenseCategory`, and `ExpenseSplit` for splitting expenses among trip members with payment status tracking
- **Packing Management:** `PackingItem` with `PackingCategory`, quantity tracking, packed status, and member assignment
- **Checklist System:** `ChecklistItem` with category phases (Pre-Trip, During Trip, Post-Trip), priority levels (Low, Medium, High), due dates, and completion tracking
- **Tag System:** Trip categorization model `Tag` with Usage Counter

These models have complicated relationships through `ForeignKey`, `ManyToManyField`, and `through` tables, necessitating a high degree of diligence in maintaining data integrity and optimizing queries with `select_related()` and `prefetch_related()`.

#### 2. Authentication System

Unlike the simple session-based authentication in course projects, Jelajah uses:

- **JWT (JSON Web Token) Authentication** with `djangorestframework-simplejwt`
- **HTTP-Only Secure Cookies** to store tokens and protect against XSS attacks
- **Custom Token Views** (`CookieTokenObtainPairView`, `CookieTokenRefreshView`, `CookieTokenBlacklistView`) that manage cookies automatically
- **Token Blacklisting** for secure logout
- **Set Password Flow** for users invited to trips who do not have accounts yet
- **Rate Limiting** on sensitive endpoints using `ScopedRateThrottle`

#### 3. REST API Design

The backend provides a complete RESTful API with:

- **Nested Resource Routing:** Trip-specific resources accessed via nested URLs (e.g., `/api/trips/<trip_id>/itineraries/items/`)
- **Custom Permission Classes:** `IsTripAccessible`, `IsMemberAccessible`, `IsExpenseAccessible`, `IsItineraryItemAccessible`, `IsChecklistItemAccessible` for precise access control
- **Statistics Endpoints:** Combined data for expenses, itineraries, checklists, and members using Django ORM aggregation functions
- **Filtering:** Query parameter-based filtering for status, category, destination, difficulty, and more
- **ViewSets with Custom Actions:** Full CRUD operations plus specialized endpoints

#### 4. Notification System via Email

For transactional emails, Jelajah is integrated with **SendGrid**:

- Welcome emails on registration
- Invitations to join a trip (with distinct processes for new and existing users)
- Notifications of status changes (accepted, declined, blocked)
- Notifying trip owners of join requests
- Reset passwords and set emails

Every email is professionally formatted using **HTML templates** that are kept in the backend.

#### 5. Frontend Architecture with React

Advanced React patterns are displayed on the frontend:

- **Context API for State Management:** Distinct contexts for Auth, Trips, Trip, Members, Itineraries, Expenses, Checklist, PackingItems, and Tags
- **Custom Hooks:** Reusable logic extraction for data fetching and state management
- **Component Composition:** Modular UI components with a clear division of responsibilities
- **Protected Routes:** Authentication-aware routing with redirect handling
- **Form Validation:** Client-side validation with error handling
- **Responsive Design:** Mobile-first strategy using CSS and contemporary layout techniques.

#### 6. Deployment and DevOps

- **Docker Containerization:** Multi-service setup with `docker-compose.yml`
- **PostgreSQL Database:** Production-grade database with persistent volumes
- **Environment Configuration:** `.env` files for sensitive settings
- **Render Deployment:** `render.yaml` for cloud deployment
- **CI/CD Pipeline:** GitHub Actions workflow for automated testing

---

## File Structure

### Backend (`backend/`)

```
backend/
├── backend/                    # Main Django project settings
│   ├── settings.py            # Django configuration (database, JWT, CORS, email)
│   ├── urls.py                # Root URL routing
│   ├── models.py              # BaseModel with UUID and timestamps
│   ├── permissions.py         # Shared permission classes
│   └── services.py            # Email service utilities
├── users/                      # User authentication app
│   ├── models.py              # Custom User model with UserManager
│   ├── views.py               # Registration, login, profile, password views
│   ├── serializers.py         # User data serialization
│   ├── urls.py                # Auth endpoints
│   └── tests.py               # User app tests
├── trips/                      # Core trip management app
│   ├── models.py              # Trip, TripMember, Tag models
│   ├── views.py               # Trip CRUD, join requests, statistics
│   ├── serializers.py         # Trip data serialization
│   ├── permissions.py         # Trip access control
│   ├── urls.py                # Trip endpoints
│   └── tests.py               # Trip app tests
├── itineraries/                # Itinerary planning app
│   ├── models.py              # ItineraryItem, ItineraryType models
│   ├── views.py               # Itinerary CRUD and statistics
│   ├── serializers.py         # Itinerary serialization
│   ├── permissions.py         # Itinerary access control
│   ├── urls.py                # Itinerary endpoints
│   └── tests.py               # Itinerary app tests
├── expenses/                   # Expense tracking app
│   ├── models.py              # Expense, ExpenseCategory, ExpenseSplit models
│   ├── views.py               # Expense CRUD and statistics
│   ├── serializers.py         # Expense serialization
│   ├── permissions.py         # Expense access control
│   ├── urls.py                # Expense endpoints
│   └── tests.py               # Expense app tests
├── packing/                    # Packing list app
│   ├── models.py              # PackingItem, PackingCategory models
│   ├── views.py               # Packing CRUD and statistics
│   ├── serializers.py         # Packing serialization
│   ├── permissions.py         # Packing access control
│   ├── urls.py                # Packing endpoints
│   └── tests.py               # Packing app tests
├── checklist/                  # Checklist management app
│   ├── models.py              # ChecklistItem model with priorities
│   ├── views.py               # Checklist CRUD and statistics
│   ├── serializers.py         # Checklist serialization
│   ├── permissions.py         # Checklist access control
│   ├── urls.py                # Checklist endpoints
│   └── tests.py               # Checklist app tests
├── templates/                  # Email HTML templates
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Backend container configuration
├── build.sh                   # Build script for deployment
└── manage.py                  # Django management script
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ChecklistManager.jsx    # Checklist CRUD interface
│   │   ├── ExpensesManager.jsx     # Expense tracking interface
│   │   ├── ItinerariesManager.jsx  # Itinerary planning interface
│   │   ├── MembersManager.jsx      # Member management interface
│   │   ├── PackingList.jsx         # Packing list interface
│   │   ├── TripOverview.jsx        # Trip summary dashboard
│   │   ├── UserAvatar.jsx          # User profile avatar
│   │   ├── dialogs/               # Modal dialog components
│   │   ├── layouts/               # Page layout components
│   │   └── ui/                    # Base UI components
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.jsx        # Authentication state
│   │   ├── TripContext.jsx        # Single trip state
│   │   ├── TripsContext.jsx       # Trip list state
│   │   ├── MembersContext.jsx     # Trip members state
│   │   ├── ItinerariesContext.jsx # Itinerary state
│   │   ├── ExpensesContext.jsx    # Expenses state
│   │   ├── ChecklistContext.jsx   # Checklist state
│   │   ├── PackingItemsContext.jsx # Packing items state
│   │   └── TagsContext.jsx        # Tags state
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Home.jsx              # Landing page with trip discovery
│   │   ├── MyTrips.jsx           # User's trips list
│   │   ├── TripDetail.jsx        # Public trip view
│   │   ├── TripManage.jsx        # Trip management dashboard
│   │   ├── NotFound.jsx          # 404 page
│   │   └── auth/                 # Authentication pages
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── SetPassword.jsx
│   │       └── ResendSetPasswordEmail.jsx
│   ├── configs/               # Configuration files
│   ├── lib/                   # Utility functions
│   ├── assets/                # Static assets (images, icons)
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── package.json               # Node.js dependencies
├── vite.config.js             # Vite bundler configuration
├── Dockerfile                 # Frontend container configuration
└── README.md                  # Vite template documentation
```

### Root Directory

```
├── .github/
│   └── workflows/
│       ├── backend.yml        # GitHub Actions CI/CD workflow
│       └── frontend.yml       # Frontend CI/CD workflow
├── docker-compose.yml         # Development Docker configuration
├── render.yaml                # Render deployment configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This documentation file
```

---

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+
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
   ALLOWED_HOSTS=localhost,127. 0.0.1
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

3. **Set up environment variables** (create `backend/.env` as shown above, adjust DB settings for local PostgreSQL)

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

2. **Create environment file** (`frontend/.env` as shown above)

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
- psycopg2-binary (PostgreSQL adapter)
- SendGrid (Email delivery)
- Pillow (Image processing)
- Gunicorn (WSGI server)
- WhiteNoise (Static files)

**Frontend:**

- React 18+ with Vite
- React Router (Client-side routing)
- Context API (State management)
- CSS3 with responsive design

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

### Mobile Responsiveness

The frontend uses a mobile-first design approach with CSS media queries and flexible layouts.

---

## Future Improvements

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
