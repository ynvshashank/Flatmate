# Quick Start Guide - Flatmate Todo App

Welcome! This guide will help you set up and run the Flatmate shared todo application.

## What Was Built

You now have a **complete backend** for your shared todo application with:

✅ User authentication (login/register)  
✅ Database schema (Users, Houses, Tasks, Flatmates)  
✅ API routes for all features  
✅ Database connection with Prisma  
✅ Authentication with NextAuth  
✅ Password hashing with bcrypt  
✅ RESTful API endpoints  

## What You Need to Do

### 1. Install Dependencies

```bash
npm install
```

This will install all the packages including:
- Prisma (database ORM)
- NextAuth (authentication)
- bcryptjs (password hashing)
- nanoid (invite code generation)
- And all other dependencies

### 2. Set Up Database

**Option A: Use Supabase (Easier for beginners)**

1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

**Option B: Use Local PostgreSQL**

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database:
   ```bash
   createdb flatmate_db
   ```

### 3. Create Environment File

Create a file named `.env` in the root directory:

```env
# Database (replace with your connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/flatmate_db?schema=public"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"

# NextAuth URL
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Set Up the Database

```bash
# Generate Prisma Client (connects to your database)
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## Project Structure Explained

```
📁 Your Project
├── 📁 app/
│   ├── 📁 api/              ← Backend API routes
│   │   ├── 📁 auth/         ← Login, register
│   │   ├── 📁 tasks/        ← Task CRUD operations
│   │   ├── 📁 houses/       ← House management
│   │   └── 📁 flatmates/   ← Flatmate management
│   ├── page.tsx             ← Home/login page (already has UI)
│   ├── dashboard/           ← Dashboard (has UI, needs API connection)
│   └── register/            ← Registration (has UI, needs API connection)
│
├── 📁 lib/
│   ├── prisma.ts            ← Database client
│   └── auth.ts              ← Authentication config
│
├── 📁 prisma/
│   └── schema.prisma        ← Database structure
│
├── 📁 components/
│   ├── 📁 ui/               ← Reusable UI components
│   └── 📁 providers/        ← React context providers
│
├── 📄 DEVELOPMENT.md        ← Complete development guide
├── 📄 README.md             ← Project overview
└── 📄 SETUP_INSTRUCTIONS.md ← This file!
```

---

## Understanding the Files

### Backend (Already Done ✅)

1. **prisma/schema.prisma** - Defines your database structure
   - Users, Houses, Tasks, Flatmates
   - Relationships between them

2. **lib/prisma.ts** - Connects to database
   - Prevents multiple connections
   - Reusable across the app

3. **lib/auth.ts** - Authentication setup
   - How users log in
   - Password validation

4. **app/api/** - All API endpoints
   - `/api/auth/register` - Create account
   - `/api/tasks` - Create/list tasks
   - `/api/houses` - Manage houses
   - `/api/flatmates` - Add flatmates

### Frontend (Needs Connection ⚠️)

1. **app/page.tsx** - Login page (UI ready, needs API call)
2. **app/register/page.tsx** - Registration (UI ready, needs API call)
3. **app/dashboard/page.tsx** - Main app (has mock data, needs API calls)

---

## Next Steps: Connect Frontend to Backend

The frontend currently has **mock data**. To make it work with the real backend:

### 1. Update Registration Page

Currently: Shows form but doesn't save to database  
Need to: Call `POST /api/auth/register`

Example code:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }),
  })
  
  const data = await res.json()
  
  if (res.ok) {
    // Redirect to dashboard or login
  } else {
    // Show error message
  }
}
```

### 2. Update Login Page

Currently: Shows form but doesn't authenticate  
Need to: Use NextAuth's `signIn` function

```typescript
import { signIn } from 'next-auth/react'

const handleLogin = async () => {
  await signIn('credentials', {
    email,
    password,
    callbackUrl: '/dashboard'
  })
}
```

### 3. Update Dashboard

Currently: Uses mock data  
Need to: Fetch tasks from API

```typescript
useEffect(() => {
  const fetchTasks = async () => {
    const res = await fetch('/api/tasks?houseId=YOUR_HOUSE_ID')
    const { tasks } = await res.json()
    setTasks(tasks)
  }
  
  fetchTasks()
}, [])
```

---

## Testing the Backend

### Using Prisma Studio (Database GUI)

```bash
npm run db:studio
```

This opens a web interface to see your database tables and data.

### Testing API Endpoints

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

Example:
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'
```

---

## Key Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open database GUI

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run linter
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Defines database structure |
| `lib/prisma.ts` | Database connection singleton |
| `lib/auth.ts` | Authentication configuration |
| `app/api/auth/register/route.ts` | User registration endpoint |
| `app/api/tasks/route.ts` | Task list/create operations |
| `app/api/tasks/[id]/route.ts` | Single task operations |
| `app/api/houses/route.ts` | House management |
| `app/api/flatmates/route.ts` | Flatmate invitations |
| `middleware.ts` | Protects routes from unauthorized access |

---

## Common Issues and Solutions

### "Prisma Client not found"
```bash
npm run db:generate
```

### "Database connection error"
- Check your DATABASE_URL in `.env`
- Make sure PostgreSQL is running

### "NEXTAUTH_SECRET missing"
- Add NEXTAUTH_SECRET to `.env`
- Generate one: `openssl rand -base64 32`

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## Learning Path

To understand how this all works together:

1. **Start with**: `DEVELOPMENT.md` - Complete development guide
2. **Read**: `README.md` - Project overview
3. **Explore**: Database structure in `prisma/schema.prisma`
4. **Practice**: Make API calls from frontend
5. **Build**: Add new features

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [Supabase (Database)](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

If you get stuck:
1. Check `DEVELOPMENT.md` for detailed explanations
2. Read the error message carefully
3. Check that your `.env` file is configured correctly
4. Make sure you ran `npm run db:push`

Good luck building! 🚀


