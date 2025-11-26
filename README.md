# Jelajah - Travel Planning Web Application

## Overview

Jelajah is a comprehensive travel planning platform designed to help travelers organize every aspect of their trips. Built with **Django REST Framework** as the backend API and **React** as a Single Page Application (SPA) frontend, Jelajah provides an all-in-one solution for managing trips, itineraries, expenses, packing lists, checklists, and trip members. The application supports collaborative trip planning, allowing multiple users to join trips and contribute to planning activities.

**Live Demo:** [Add your deployed URL here]

**Screencast:** [Add your YouTube video link here]

---

## Distinctiveness and Complexity

### Why This Project is Distinct

Jelajah is fundamentally different from the other CS50W projects in both concept and implementation:

1. **Not a Social Network (Project 4):** While Jelajah has user accounts and allows multiple users to participate in trips, the core functionality is **trip planning and management**, not social interaction. There are no posts, likes, followers, or feeds. The user relationships exist solely within the context of trip membership, where users collaborate on planning logistics rather than engaging in social networking activities.

2. **Not an E-commerce Site (Project 2):** Jelajah does not involve buying or selling products. There are no shopping carts, product listings, payment processing, or order management. The expense tracking feature is for **recording and splitting costs among trip members**, not for commercial transactions. Users track what they've already spent during trips, not purchasing items through the platform.

3. **Not a Wiki or Mail Application (Projects 1 & 3):** Unlike the Wiki project, Jelajah doesn't focus on content creation and editing with markdown. Unlike the Mail project, it's not about sending and receiving messages. Jelajah is a **domain-specific planning tool** with complex relational data models.

### Technical Complexity

The complexity of Jelajah far exceeds the course projects in several key areas:

#### 1. Multi-Domain Data Architecture (12+ Django Models)

Jelajah implements a sophisticated data model with multiple interconnected entities:

- **User Management:** Custom `User` model extending `AbstractUser` with email-based authentication, profile fields (bio, avatar, phone), and custom `UserManager`
- **Trip System:** `Trip` model with complex fields including status tracking (Planning, Ongoing, Completed, Cancelled, Deleted), difficulty levels, budget management, public/private visibility, and joinability settings
- **Member Management:** `TripMember` model with role-based access (Organizer, Co-Organizer, Member), status workflow (Pending, Accepted, Declined, Blocked), and emergency contact information
- **Itinerary Planning:** `ItineraryItem` with geolocation support (latitude/longitude), visit scheduling, status tracking (Planned, Visited, Skipped), and `ItineraryType` categorization
- **Expense Tracking:** `Expense` model with `ExpenseCategory`, and `ExpenseSplit` for dividing costs among trip members with payment status tracking
- **Packing Management:** `PackingItem` with `PackingCategory`, quantity tracking, packed status, and member assignment
- **Checklist System:** `ChecklistItem` with category phases (Pre-Trip, During Trip, Post-Trip), priority levels (Low, Medium, High), due dates, and completion tracking
- **Tagging System:** `Tag` model for trip categorization with usage counting

These models have complex relationships using `ForeignKey`, `ManyToManyField`, and `through` tables, requiring careful consideration of data integrity and query optimization using `select_related()` and `prefetch_related()`.

#### 2. Advanced Authentication System

Unlike the simple session-based authentication in course projects, Jelajah implements:

- **JWT (JSON Web Token) Authentication** using `djangorestframework-simplejwt`
- **HTTP-Only Secure Cookies** for token storage, preventing XSS attacks
- **Custom Token Views** (`CookieTokenObtainPairView`, `CookieTokenRefreshView`, `CookieTokenBlacklistView`) that handle cookie management automatically
- **Token Blacklisting** for secure logout
- **Set Password Flow** for users invited to trips who don't have accounts yet
- **Rate Limiting** on sensitive endpoints using `ScopedRateThrottle`

#### 3. Comprehensive REST API Design

The backend exposes a full RESTful API with:

- **Nested Resource Routing:** Trip-specific resources are accessed via nested URLs (e.g., `/api/trips/<trip_id>/itineraries/items/`)
- **Custom Permission Classes:** `IsTripAccessible`, `IsMemberAccessible`, `IsExpenseAccessible`, `IsItineraryItemAccessible`, `IsChecklistItemAccessible` for fine-grained access control
- **Statistics Endpoints:** Aggregated data for expenses, itineraries, checklists, and members using Django ORM aggregation functions
- **Advanced Filtering:** Query parameter-based filtering for status, category, destination, difficulty, and more
- **ViewSets with Custom Actions:** Full CRUD operations plus specialized endpoints

#### 4. Email Notification System

Jelajah integrates with **SendGrid** for transactional emails:

- Welcome emails on registration
- Trip membership invitations (with different flows for new vs existing users)
- Status change notifications (accepted, declined, blocked)
- Join request notifications to trip owners
- Password reset/set emails

Each email uses **HTML templates** stored in the backend for professional formatting.

#### 5. React Frontend Architecture

The frontend demonstrates advanced React patterns:

- **Context API for State Management:** Separate contexts for Auth, Trips, Trip, Members, Itineraries, Expenses, Checklist, PackingItems, and Tags
- **Custom Hooks:** Reusable logic extraction for data fetching and state management
- **Component Composition:** Modular UI components with clear separation of concerns
- **Protected Routes:** Authentication-aware routing with redirect handling
- **Form Validation:** Client-side validation with error handling
- **Responsive Design:** Mobile-first approach using CSS and modern layout techniques

#### 6. DevOps and Deployment

- **Docker Containerization:** Multi-service setup with `docker-compose. yml` for development and `docker-compose. prod.yml` for production
- **PostgreSQL Database:** Production-grade database with persistent volumes
- **Environment Configuration:** Separate `. env` files for development and production
- **Render Deployment:** `render.yaml` for cloud deployment configuration
- **CI/CD Pipeline:** GitHub Actions workflow for automated testing

### Feature Comparison with Course Projects

| Feature           | Project 2 (Commerce) | Project 4 (Network) | Jelajah                       |
| ----------------- | -------------------- | ------------------- | ----------------------------- |
| Models            | 3-4                  | 3-4                 | 12+                           |
| Authentication    | Session-based        | Session-based       | JWT + Cookies                 |
| API Design        | Django Views         | Basic API           | Full REST API                 |
| Frontend          | Django Templates     | Vanilla JS          | React SPA                     |
| State Management  | None                 | None                | Context API                   |
| Email Integration | None                 | None                | SendGrid                      |
| Containerization  | None                 | None                | Docker                        |
| Real-time Stats   | None                 | None                | Aggregated Statistics         |
| Role-based Access | None                 | None                | Organizer/Co-Organizer/Member |

---

## File Structure

### Backend (`backend/`)

```
backend/
├── backend/                    # Main Django project settings
│   ├── settings. py            # Django configuration (database, JWT, CORS, email)
│   ├── urls.py                # Root URL routing
│   ├── models.py              # BaseModel with UUID and timestamps
│   ├── permissions.py         # Shared permission classes
│   └── services.py            # Email service utilities
├── users/                      # User authentication app
│   ├── models. py              # Custom User model with UserManager
│   ├── views.py               # Registration, login, profile, password views
│   ├── serializers.py         # User data serialization
│   ├── urls.py                # Auth endpoints
│   └── tests/                 # Unit and API tests
├── trips/                      # Core trip management app
│   ├── models. py              # Trip, TripMember, Tag models
│   ├── views. py               # Trip CRUD, join requests, statistics
│   ├── serializers.py         # Trip data serialization
│   ├── permissions.py         # Trip access control
│   └── urls.py                # Trip endpoints
├── itineraries/                # Itinerary planning app
│   ├── models.py              # ItineraryItem, ItineraryType models
│   ├── views.py               # Itinerary CRUD and statistics
│   ├── serializers.py         # Itinerary serialization
│   ├── permissions.py         # Itinerary access control
│   └── urls.py                # Itinerary endpoints
├── expenses/                   # Expense tracking app
│   ├── models.py              # Expense, ExpenseCategory, ExpenseSplit models
│   ├── views.py               # Expense CRUD and statistics
│   ├── serializers.py         # Expense serialization
│   ├── permissions.py         # Expense access control
│   └── urls.py                # Expense endpoints
├── packing/                    # Packing list app
│   ├── models.py              # PackingItem, PackingCategory models
│   ├── views.py               # Packing CRUD and statistics
│   ├── serializers.py         # Packing serialization
│   ├── permissions.py         # Packing access control
│   └── urls.py                # Packing endpoints
├── checklist/                  # Checklist management app
│   ├── models.py              # ChecklistItem model with priorities
│   ├── views. py               # Checklist CRUD and statistics
│   ├── serializers.py         # Checklist serialization
│   ├── permissions.py         # Checklist access control
│   └── urls.py                # Checklist endpoints
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
│   │   ├── ItinerariesManager. jsx  # Itinerary planning interface
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
│   │   ├── PackingItemsContext. jsx # Packing items state
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
├── . github/
│   └── workflows/
│       └── ci. yml             # GitHub Actions CI/CD pipeline
├── docker-compose.yml         # Development Docker configuration
├── docker-compose. prod.yml    # Production Docker configuration
├── render.yaml                # Render deployment configuration
├── . gitignore                 # Git ignore rules
└── README.md                  # This documentation file
```

---

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (or Docker)
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository:**

   ```bash
   git clone https://github. com/gitraya/jelajah.git
   cd jelajah
   ```

2. **Create environment files:**

   Create `backend/.env. dev`:

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

   Create `frontend/.env.dev`:

   ```dotenv
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Build and start services:**

   ```bash
   docker-compose up --build
   ```

4. **Apply database migrations:**

   ```bash
   docker-compose exec backend python manage. py migrate
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

3. **Set up environment variables** (create `backend/.env.dev` as shown above, adjust DB settings for local PostgreSQL)

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

2. **Create environment file** (`frontend/.env.dev` as shown above)

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

| Method | Endpoint                                    | Description              |
| ------ | ------------------------------------------- | ------------------------ |
| POST   | `/api/auth/register/`                       | Register new user        |
| POST   | `/api/auth/login/`                          | Login (JWT token)        |
| POST   | `/api/auth/logout/`                         | Logout (blacklist token) |
| POST   | `/api/auth/refresh/`                        | Refresh access token     |
| GET    | `/api/auth/me/`                             | Get current user         |
| PUT    | `/api/auth/me/`                             | Update current user      |
| POST   | `/api/auth/set-password/<user_id>/<token>/` | Set password             |

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

| Method | Endpoint                                   | Description         |
| ------ | ------------------------------------------ | ------------------- |
| GET    | `/api/trips/<trip_id>/packing/items/`      | List packing items  |
| POST   | `/api/trips/<trip_id>/packing/items/`      | Create packing item |
| PUT    | `/api/trips/<trip_id>/packing/items/<id>/` | Update packing item |
| DELETE | `/api/trips/<trip_id>/packing/items/<id>/` | Delete packing item |
| GET    | `/api/trips/<trip_id>/packing/statistics/` | Packing statistics  |

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

### Security Features

- JWT tokens stored in HTTP-only cookies (prevents XSS)
- CORS configuration for cross-origin requests
- CSRF protection
- Password hashing with Django's built-in system
- Token blacklisting on logout
- Rate limiting on authentication endpoints
- Role-based access control for trip resources

### Mobile Responsiveness

The application is fully responsive and optimized for:

- Desktop browsers (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (< 768px)

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
