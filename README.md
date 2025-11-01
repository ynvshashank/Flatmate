# Flatmate - Shared Todo List App

A collaborative todo list application designed for flatmates to manage shared tasks and keep their living space organized.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **House Management**: Create and manage multiple shared living spaces
- **Task Management**: Create, edit, complete, and delete tasks with priorities and deadlines
- **Connections**: Manage global connections across all houses
- **Profile Settings**: Update profile information, change password, and view statistics
- **Responsive Design**: Modern, clean UI that works on all devices
- **Real-time Updates**: Live task status updates and notifications
- **FastAPI Backend**: Complete FastAPI backend with SQLAlchemy ORM and SQLite/PostgreSQL support

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **API Client**: Custom JWT-based authentication

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy with Pydantic models
- **Authentication**: JWT tokens with custom authentication
- **Password Hashing**: PBKDF2-SHA256
- **API**: RESTful API with automatic OpenAPI documentation
- **CORS**: Configured for frontend integration

## Project Structure

```
flatmate/
├── app/                    # Next.js frontend app directory
│   ├── dashboard/         # Dashboard page (houses view)
│   ├── register/          # Registration page
│   ├── house/[id]/        # House page (tasks view)
│   ├── connections/       # Connections page
│   ├── settings/          # Settings page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/login page
├── components/            # Reusable React components
│   └── ui/               # UI component library (buttons, cards, etc.)
├── lib/                  # Utility functions
│   └── api.ts            # API client for FastAPI backend
├── app/                  # FastAPI backend directory
│   ├── main.py           # FastAPI app setup and routing
│   ├── core/             # Core functionality
│   │   ├── config.py     # Settings and configuration
│   │   └── auth.py       # JWT authentication utilities
│   ├── db/               # Database setup
│   │   └── session.py    # Database session management
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   ├── house.py      # House model
│   │   ├── house_member.py # House membership model
│   │   └── task.py       # Task model
│   ├── api/              # API endpoints
│   │   └── api_v1/
│   │       ├── endpoints/ # API route handlers
│   │       │   ├── auth.py    # Authentication endpoints
│   │       │   ├── houses.py  # House management endpoints
│   │       │   └── tasks.py   # Task management endpoints
│   │       └── api.py    # API router setup
│   └── deps.py           # Dependencies (auth middleware)
├── requirements.txt      # Python dependencies
├── init_db.py           # Database initialization script
├── test_api.py          # API testing script
├── package.json         # Node.js dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Python 3.8+** (Download from [python.org](https://python.org/))
- **PostgreSQL** (optional - SQLite works for development)
- **npm or yarn** and **pip**

### Step-by-Step Setup

#### 1. Clone and Install Frontend Dependencies

```bash
git clone https://github.com/ynvshashank/Flatmate.git
cd Flatmate
npm install
```

#### 2. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Set Up the Database

**Option A: SQLite (Recommended for development)**
```bash
python init_db.py
```
This creates a local SQLite database automatically.

**Option B: PostgreSQL**
If you prefer PostgreSQL, set up your database and update the `.env` file.

#### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite:///./flatmate.db

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Frontend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
```

#### 5. Start Both Servers

**Terminal 1 - Backend:**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### 6. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma Client

## Database Schema

The application uses the following main entities:

- **User**: Users who can log in and create/join houses
- **FlatmateHouse**: A shared space/house with its own tasks
- **Flatmate**: Relationship between users and houses
- **Task**: Todo items with assignment, priority, and scheduling
- **Notification**: System notifications for tasks

## API Endpoints

### Authentication
- `POST /auth/login` - User login with JWT token
- `POST /auth/register` - User registration

### Houses
- `GET /houses/user` - Get all houses for the current user
- `POST /houses/create` - Create a new house
- `POST /houses/exit` - Exit a house (non-creator only)
- `DELETE /houses/delete` - Delete a house (creator only)
- `POST /houses/invite` - Invite user to house

### Tasks
- `GET /tasks/today` - Get today's tasks for user's houses
- `POST /tasks/create` - Create a new task
- `PUT /tasks/update` - Update a task
- `DELETE /tasks/delete` - Delete a task
- `POST /tasks/complete` - Mark task as completed

### API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Usage Guide

### Creating Your First Account

1. Navigate to the home page
2. Click "Don't have an account? Sign up"
3. Fill in your name, email, and password
4. Click "Create Account"

### Creating a House

1. After registration, you'll be able to create or join a house
2. To create a house:
   - Click "Create House" (feature to be connected)
   - Give it a name (e.g., "My Flat")
   - You'll get a unique invite code
   - Share this code with your flatmates

### Joining a House

1. Get the invite code from the house creator
2. Click "Join House"
3. Enter the invite code
4. You're now part of the house!

### Creating Tasks

1. From the dashboard, click "Add Task"
2. Fill in:
   - Task title
   - Description (optional)
   - Assign to a flatmate
   - Due date
   - Priority level
3. Click "Add Task"

### Managing Tasks

- Check the checkbox to mark tasks as completed
- Edit tasks by clicking the options menu
- View pending vs completed tasks in separate sections

## Development Workflow

### Understanding the Codebase

**Frontend to Backend Flow:**

1. **User interacts** with UI (e.g., clicks "Create House")
2. **Frontend** calls API client (`lib/api.ts`) with JWT token
3. **FastAPI** validates JWT token using dependency injection
4. **SQLAlchemy ORM** interacts with SQLite/PostgreSQL database
5. **Database** stores/retrieves data with proper relationships
6. **FastAPI** returns JSON response with Pydantic models
7. **Frontend** updates UI with new data and shows toast notifications

### Key Files to Understand

**Backend:**
- `app/main.py` - FastAPI app setup and CORS configuration
- `app/core/auth.py` - JWT token creation and password hashing
- `app/core/config.py` - Environment variables and settings
- `app/models/user.py` - SQLAlchemy user model with relationships
- `app/api/api_v1/endpoints/auth.py` - Authentication endpoints
- `app/api/api_v1/endpoints/houses.py` - House management endpoints
- `app/db/session.py` - Database session management

**Frontend:**
- `lib/api.ts` - API client with JWT token handling
- `app/dashboard/page.tsx` - Main dashboard with house management
- `app/page.tsx` - Login page with authentication
- `components/ui/` - Reusable UI components

### Adding a New Feature

**Backend:**
1. **Create/Update SQLAlchemy Model** (`app/models/`)
2. **Add Pydantic Schemas** in endpoint files
3. **Create API Endpoint** (`app/api/api_v1/endpoints/`)
4. **Update Router** in `app/api/api_v1/api.py`
5. **Test with** `test_api.py`

**Frontend:**
1. **Update API Client** (`lib/api.ts`)
2. **Create/Update React Component**
3. **Add Navigation** if needed
4. **Test Integration** with backend

### Testing

```bash
# Test backend API
python test_api.py

# Test frontend
npm run dev

# Test backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Common Issues

### "Prisma Client not found"
Run: `npm run db:generate`

### "Database connection error"
Check your `DATABASE_URL` in `.env` file

### "NEXTAUTH_SECRET missing"
Add a secret key to your `.env` file

### "Module not found"
Run: `npm install`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Current Implementation Status

### ✅ Completed Features

**Core Pages:**
- **Login/Register Pages**: Full FastAPI integration with JWT token management
- **Dashboard (Houses View)**: Complete house management with create, invite, exit, and delete functionality
- **House Page (Tasks View)**: Full task management with create, edit, complete, and delete operations
- **Connections Page**: Global connection management with invite/accept/block functionality
- **Settings Page**: Profile management, password change, and account deletion

**Technical Implementation:**
- **FastAPI Integration**: Complete API client with proper error handling and token management
- **Responsive Design**: Modern UI using Tailwind CSS with consistent theming
- **Authentication Flow**: JWT-based authentication with automatic token refresh
- **Navigation**: Seamless navigation between all pages with proper state management
- **Error Handling**: Comprehensive error handling with user-friendly toast notifications
- **Loading States**: Proper loading indicators throughout the application

### 🔄 Ready for Backend Connection

The frontend is fully prepared to connect to your FastAPI backend. Simply:

1. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your FastAPI backend URL
   NEXT_PUBLIC_API_BASE_URL=https://your-fastapi-url
   ```

2. **Update API Endpoints**: The API client in `lib/api.ts` is already configured with the correct endpoints matching your FastAPI backend structure.

3. **Test the Integration**: All pages will automatically use real API calls instead of mock data.

### 📱 Pages Overview

- **Home (`/`)**: Landing page with login form and feature showcase
- **Register (`/register`)**: User registration with validation
- **Dashboard (`/dashboard`)**: Houses overview with management options
- **House (`/house/[id]`)**: Task management for specific houses
- **Connections (`/connections`)**: Global connection management
- **Settings (`/settings`)**: User profile and account management

### 🎨 Design Features

- **Modern UI**: Clean, Notion-inspired design with neutral colors and rounded edges
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Consistent Theming**: Primary/secondary color scheme throughout
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive UX
- **Accessibility**: Proper labels, focus states, and keyboard navigation

## 🚀 Version 2.0.0 - Major Architecture Overhaul

### What Changed in v2.0.0

**Complete Backend Rewrite:**
- **Removed**: Next.js API routes with Prisma ORM
- **Added**: Full FastAPI backend with SQLAlchemy ORM
- **Database**: SQLite (dev) / PostgreSQL (prod) support
- **Authentication**: Custom JWT implementation replacing NextAuth.js

**Key Improvements:**
- ✅ **Performance**: FastAPI is significantly faster than Next.js API routes
- ✅ **Scalability**: SQLAlchemy handles complex queries better than Prisma
- ✅ **Type Safety**: Pydantic models provide better type validation
- ✅ **Documentation**: Automatic OpenAPI/Swagger documentation
- ✅ **Database Flexibility**: Easy switching between SQLite/PostgreSQL
- ✅ **Clean Architecture**: Separation of concerns with proper layering

**Migration Guide:**
```bash
# Old setup (v1.x)
npm install
npm run db:generate
npm run db:push
npm run dev

# New setup (v2.0+)
npm install
pip install -r requirements.txt
python init_db.py
# Terminal 1: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Terminal 2: npm run dev
```

**Breaking Changes:**
- Environment variables updated (see `.env.example`)
- API endpoints changed from `/api/*` to direct paths (`/auth/*`, `/houses/*`)
- Database schema migrated from Prisma to SQLAlchemy
- Authentication system completely rewritten

**New Features in v2.0:**
- JWT token-based authentication
- Automatic API documentation at `/docs`
- Comprehensive test suite (`test_api.py`)
- Better error handling and validation
- CORS properly configured for frontend integration

### 📋 Detailed Changes in v2.0.0

#### 🗑️ Files Removed
**Development Documentation:**
- `BACKEND_IMPLEMENTATION_STATUS.md`
- `COMPLETE_EXPLANATION.md`
- `DEVELOPMENT.md`
- `FASTAPI_BACKEND_GUIDE.md`
- `FRONTEND_STATUS.md`
- `IMPLEMENTATION_SUMMARY.md`
- `SETUP_INSTRUCTIONS.md`
- `readme` (duplicate lowercase file)

**Old Architecture Files:**
- `backend_setup.py` (initial setup script)
- `frontend.env` (redundant environment file)
- `prisma/` (entire directory - Prisma ORM no longer used)
- `app/api/auth/[...nextauth]/` (NextAuth API routes)

#### 📝 Files Updated
**Frontend:**
- `lib/api.ts` - Updated API client for FastAPI endpoints
- `app/layout.tsx` - Removed NextAuth session provider
- `app/page.tsx` - Updated login form for new authentication
- `package.json` - Removed NextAuth/Prisma deps, updated scripts, version to 2.0.0

**Backend (New):**
- `app/main.py` - FastAPI app with CORS and routing
- `app/core/auth.py` - JWT token utilities
- `app/core/config.py` - Environment configuration
- `app/models/user.py` - SQLAlchemy user model
- `app/models/house.py` - House model with relationships
- `app/models/house_member.py` - Membership relationships
- `app/models/task.py` - Task model
- `app/api/api_v1/endpoints/auth.py` - Authentication endpoints
- `app/api/api_v1/endpoints/houses.py` - House management
- `app/api/api_v1/endpoints/tasks.py` - Task management
- `app/db/session.py` - Database session management

**Configuration:**
- `.gitignore` - Added Python, database, and IDE exclusions
- `.env.example` - Updated for FastAPI environment variables
- `README.md` - Complete rewrite with new architecture docs

#### ➕ Files Added
**Backend Infrastructure:**
- `requirements.txt` - Python dependencies
- `init_db.py` - Database initialization script
- `test_api.py` - Comprehensive API testing suite
- `app/__init__.py` - Python package initialization
- `app/api/__init__.py` - API package setup
- `app/api/api_v1/__init__.py` - API version setup
- `app/core/__init__.py` - Core package setup
- `app/db/__init__.py` - Database package setup
- `app/models/__init__.py` - Models package with imports

#### 🔄 Dependencies Changes
**Removed from package.json:**
- `next-auth` - Replaced with custom JWT
- `@prisma/client` - Replaced with SQLAlchemy
- `prisma` (dev) - ORM replaced
- `@types/bcryptjs` - No longer needed
- `bcryptjs` - Replaced with server-side hashing

**Added to requirements.txt:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `alembic` - Database migrations
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data handling
- `requests` - HTTP client for testing

#### 🏗️ Architecture Changes
**From:** Next.js API Routes + Prisma + NextAuth
**To:** FastAPI + SQLAlchemy + Custom JWT

**Database:** Prisma schema → SQLAlchemy models
**Authentication:** NextAuth.js → Custom JWT tokens
**API:** RESTful endpoints with automatic OpenAPI docs
**Testing:** Basic API tests → Comprehensive test suite

---

Made with ❤️ for organized living
