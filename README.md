# Flatmate - Shared Todo List App

A collaborative todo list application designed for flatmates to manage shared tasks and keep their living space organized.

## Features

- **User Authentication**: Secure login and registration system with bcrypt password hashing
- **Flatmate Management**: Add and manage roommates in your shared space with invite codes
- **Shared Todo Lists**: Create and manage tasks that everyone can see
- **Task Assignment**: Assign specific tasks to individual flatmates
- **Smart Notifications**: Customizable reminders with intervals (configuration ready)
- **Scheduling**: Set up recurring tasks and deadlines
- **Priority Levels**: Organize tasks by priority (low, medium, high)
- **Progress Tracking**: Track completed and pending tasks
- **RESTful API**: Complete backend API with proper authentication

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Auth**: NextAuth.js v4

### Backend
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (JWT-based)
- **Password Hashing**: bcryptjs
- **API**: RESTful API routes with Next.js API routes

## Project Structure

```
flatmate/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── tasks/        # Task CRUD operations
│   │   ├── houses/       # House/flat management
│   │   └── flatmates/    # Flatmate management
│   ├── dashboard/        # Dashboard page
│   ├── register/         # Registration page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home/login page
├── components/            # Reusable components
│   ├── ui/              # UI component library
│   └── providers/       # React providers
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   └── auth.ts          # NextAuth configuration
├── prisma/              # Prisma schema
│   └── schema.prisma    # Database schema
├── types/               # TypeScript type definitions
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **PostgreSQL** (Download from [postgresql.org](https://www.postgresql.org/download/))
- **npm or yarn**

### Step-by-Step Setup

#### 1. Clone and Install

```bash
git clone https://github.com/ynvshashank/Flatmate.git
cd Flatmate
npm install
```

#### 2. Set Up PostgreSQL Database

If you don't have PostgreSQL installed, you can:

**Option A: Install PostgreSQL locally**
1. Download from [PostgreSQL Downloads](https://www.postgresql.org/download/)
2. Install it
3. Create a new database:
   ```bash
   createdb flatmate_db
   ```

**Option B: Use a cloud database (Recommended for beginners)**
- Sign up for [Supabase](https://supabase.com) (free tier available)
- Create a new project
- Copy the connection string from your project settings

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your database URL:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flatmate_db?schema=public"
# Or use your Supabase connection string:
# DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Node Environment
NODE_ENV="development"
```

To generate a secret key for NextAuth:
```bash
openssl rand -base64 32
```

#### 4. Set Up the Database

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database
npm run db:push
```

This will create all the necessary tables in your database.

#### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth authentication endpoints

### Houses
- `GET /api/houses` - Get all houses for the current user
- `POST /api/houses` - Create a new house
- `GET /api/houses/[id]` - Get a specific house
- `DELETE /api/houses/[id]` - Delete a house (creator only)

### Tasks
- `GET /api/tasks?houseId=[id]` - Get all tasks for a house
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Flatmates
- `POST /api/flatmates` - Join a house (with code) or add a flatmate

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

1. **User interacts** with UI (e.g., clicks "Add Task")
2. **Frontend** makes a request to API route (e.g., `POST /api/tasks`)
3. **API Route** validates authentication using `getServerSession`
4. **Prisma ORM** interacts with PostgreSQL database
5. **Database** stores/retrieves data
6. **API** returns JSON response
7. **Frontend** updates UI with new data

### Key Files to Understand

- `prisma/schema.prisma` - Database structure and relationships
- `lib/auth.ts` - Authentication configuration
- `lib/prisma.ts` - Database client singleton
- `app/api/tasks/route.ts` - Task CRUD operations
- `app/dashboard/page.tsx` - Main dashboard UI (to be updated)

### Adding a New Feature

1. **Update Database Schema** (`prisma/schema.prisma`)
2. **Run** `npm run db:push`
3. **Create API Route** (e.g., `app/api/your-feature/route.ts`)
4. **Update Frontend** to call the new API
5. **Test** your feature

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

## Next Steps for Developers

The frontend currently has mock data. To connect it to the backend:

1. Update `app/dashboard/page.tsx` to use the API routes
2. Implement session management for authentication
3. Add error handling and loading states
4. Implement the notification system
5. Add recurring task functionality

---

Made with ❤️ for organized living


