# Development Guide - End-to-End Process

This guide explains the complete process of building the Flatmate application from scratch, including the order of files created and why each file exists.

## Overview: What We Built

A shared todo list application where multiple people (flatmates) can:
- Create accounts and log in
- Create or join shared spaces (houses/flats)
- Create and manage tasks together
- Assign tasks to specific people
- Set reminders and deadlines
- Organize by priority levels

---

## Part 1: Planning and Setup (The Foundation)

### Step 1: The First Files

When starting a Next.js project, the very first files you need are:

#### 1. `package.json`
**Why**: Defines dependencies, scripts, and project metadata
**What it does**: Lists all the npm packages your app needs
**Order**: Created FIRST via `npm create next-app@latest`

#### 2. `tsconfig.json`
**Why**: TypeScript configuration
**What it does**: Tells TypeScript how to compile your code
**Order**: Created automatically with Next.js

#### 3. `next.config.js`
**Why**: Next.js configuration
**What it does**: Configures Next.js behavior, webpack, etc.
**Order**: Created automatically with Next.js

#### 4. `README.md`
**Why**: Project documentation
**What it does**: Explains what the project is and how to use it
**Order**: Should be created early for documentation

---

## Part 2: Database and Backend (The Engine)

After setting up the basic Next.js project, we build the backend:

### Step 2: Database Schema

#### `prisma/schema.prisma`
**Why**: Defines your database structure
**Order**: Created FIRST when setting up database
**What it contains**:
```prisma
model User {
  // User information
}

model FlatmateHouse {
  // A shared space
}

model Task {
  // Todo items
}
```

**How to use**: 
1. Define your models
2. Run `npm run db:push` to create tables
3. Prisma generates types automatically

### Step 3: Database Connection

#### `lib/prisma.ts`
**Why**: Singleton pattern for database client
**Order**: Created after schema
**What it does**: Creates one Prisma client instance for the entire app

```typescript
// Prevents multiple database connections
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
```

---

## Part 3: Authentication (Security Layer)

### Step 4: NextAuth Setup

#### `lib/auth.ts`
**Why**: Authentication configuration
**Order**: Created after schema
**What it does**: Defines how users log in, password validation

**Key points**:
- Uses bcrypt to hash passwords
- Validates credentials
- Returns user session

#### `app/api/auth/[...nextauth]/route.ts`
**Why**: NextAuth API endpoint
**Order**: Created after auth.ts
**What it does**: Handles all auth routes (login, logout, etc.)

#### `app/api/auth/register/route.ts`
**Why**: User registration endpoint
**Order**: Created alongside auth setup
**What it does**: 
1. Validates input with Zod
2. Checks if user exists
3. Hashes password with bcrypt
4. Creates user in database

#### `types/next-auth.d.ts`
**Why**: TypeScript types for NextAuth
**Order**: Created for type safety
**What it does**: Adds custom fields to session object

---

## Part 4: API Routes (Backend Logic)

### Step 5: Task Management API

#### `app/api/tasks/route.ts`
**Why**: Task CRUD operations
**Order**: Created before frontend uses it
**What it does**:
- `GET /api/tasks` - List all tasks for a house
- `POST /api/tasks` - Create a new task

**Flow**:
1. User clicks "Add Task"
2. Frontend calls `POST /api/tasks`
3. This file validates input
4. Checks user is authenticated
5. Saves to database
6. Returns the new task

#### `app/api/tasks/[id]/route.ts`
**Why**: Single task operations
**Order**: Created with tasks route
**What it does**:
- `GET /api/tasks/[id]` - Get one task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

**ID Pattern**: The `[id]` is dynamic (e.g., `/api/tasks/abc123`)

---

## Part 5: Frontend (User Interface)

### Step 6: Pages and Components

#### `app/layout.tsx`
**Why**: Root layout for all pages
**Order**: One of the first files in Next.js
**What it does**: Wraps all pages, includes global styles, providers

#### `app/page.tsx`
**Why**: Home page (login)
**Order**: Main entry point
**What it does**: Shows login form

#### `app/register/page.tsx`
**Why**: Registration page
**Order**: Second page after login
**What it does**: Shows registration form

#### `app/dashboard/page.tsx`
**Why**: Main app interface
**Order**: Created after authentication
**What it does**: Shows tasks, flatmates, stats

**Current State**: Has mock data, needs to connect to API

#### `components/providers/session-provider.tsx`
**Why**: Session management wrapper
**Order**: Created to enable NextAuth in client components
**What it does**: Makes session available throughout the app

---

## Part 6: UI Components (Reusable Pieces)

### Step 7: Component Library

#### `components/ui/button.tsx`
**Why**: Reusable button component
**Order**: Created early for consistency
**What it does**: Standardized button styling

#### `components/ui/card.tsx`
**Why**: Card container component
**Order**: Common UI pattern
**What it does**: Wrapper for content sections

#### `components/ui/input.tsx`
**Why**: Form input component
**Order**: Needed for forms
**What it does**: Consistent input styling

#### `components/ui/label.tsx`
**Why**: Form label component
**Order**: Companion to Input
**What it does**: Accessible form labels

---

## Part 7: Configuration Files

### Step 8: Styling and Build Config

#### `tailwind.config.js`
**Why**: Tailwind CSS configuration
**Order**: Created with styling setup
**What it does**: Custom colors, fonts, utilities

#### `postcss.config.js`
**Why**: PostCSS configuration
**Order**: Required for Tailwind
**What it does**: Processes CSS

#### `app/globals.css`
**Why**: Global styles
**Order**: Created with styling setup
**What it does**: Custom CSS, scrollbar styles

#### `.gitignore`
**Why**: Version control exclusions
**Order**: Should be first
**What it does**: Lists files git should ignore

#### `.env`
**Why**: Environment variables (NOT in git)
**Order**: Create this yourself
**What it does**: Stores secrets (database URL, API keys)

---

## Part 8: The Complete Flow

### How Everything Connects

```
┌─────────────────┐
│ User Clicks     │
│ "Add Task"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Dashboard Page      │ 
│ (Client Component)  │
└────────┬────────────┘
         │ Makes API call
         ▼
┌─────────────────────┐
│ /api/tasks          │
│ (API Route)         │
└────────┬────────────┘
         │ Validates auth
         ▼
┌─────────────────────┐
│ prisma.task.create()│
│ (Database)          │
└────────┬────────────┘
         │ Saves data
         ▼
┌─────────────────────┐
│ Return JSON         │
│ to frontend         │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ UI Updates          │
│ with new task       │
└─────────────────────┘
```

---

## Order of File Creation Summary

1. **Foundation** (First)
   - `package.json`
   - `tsconfig.json`
   - `next.config.js`
   - `.gitignore`

2. **Database** (Early)
   - `prisma/schema.prisma`
   - `lib/prisma.ts`

3. **Authentication** (Early)
   - `lib/auth.ts`
   - `app/api/auth/[...nextauth]/route.ts`
   - `app/api/auth/register/route.ts`
   - `types/next-auth.d.ts`

4. **API Routes** (Middle)
   - `app/api/tasks/route.ts`
   - `app/api/tasks/[id]/route.ts`
   - `app/api/houses/route.ts`
   - `app/api/flatmates/route.ts`

5. **Frontend Pages** (After APIs)
   - `app/layout.tsx`
   - `app/page.tsx`
   - `app/register/page.tsx`
   - `app/dashboard/page.tsx`

6. **Components** (Alongside pages)
   - `components/ui/*`
   - `components/providers/*`

7. **Styling** (Throughout)
   - `tailwind.config.js`
   - `app/globals.css`

8. **Documentation** (Continuously)
   - `README.md`
   - `DEVELOPMENT.md`

---

## Common Patterns

### Pattern 1: API Route Structure
Every API route follows this pattern:
```typescript
export async function GET(request: Request) {
  // 1. Check authentication
  // 2. Validate input
  // 3. Query database
  // 4. Return response
}
```

### Pattern 2: Type Safety
Every entity has TypeScript types defined in Prisma schema and used throughout.

### Pattern 3: Authentication
Every protected route checks: `await getServerSession(authOptions)`

### Pattern 4: Error Handling
All API routes return proper HTTP status codes and error messages.

---

## Next Steps

To complete the application:

1. **Connect Frontend to Backend**: Update dashboard to use real API calls
2. **Add Error Handling**: Show user-friendly error messages
3. **Add Loading States**: Show spinners while loading
4. **Implement Notifications**: Connect reminder system
5. **Add Recurring Tasks**: Implement scheduling logic

---

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Remember**: Good software is built incrementally. Start with a working version, then add features one at a time.

