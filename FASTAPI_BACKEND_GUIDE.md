# FastAPI Backend Guide - For Flatmate App

This guide provides everything you need to build a separate **FastAPI + SQLite/PostgreSQL** backend to replace the current Next.js API routes.

## Why Separate Backend?

While the current setup uses Next.js API routes (which work great), you asked for a FastAPI + SQL backend. Benefits:

- ✅ **Separation of Concerns**: Frontend (Next.js) and Backend (FastAPI) are separate
- ✅ **Technology Flexibility**: Backend and frontend can be developed independently
- ✅ **API Reusability**: Can be used by mobile apps, other frontends, etc.
- ✅ **Python Ecosystem**: Access to Python libraries (ML, data processing, etc.)
- ✅ **Fast Performance**: FastAPI is one of the fastest Python frameworks

## What You Need to Build

### Current Architecture
```
Frontend (Next.js) → Next.js API Routes → Prisma → PostgreSQL
```

### New Architecture  
```
Frontend (Next.js) → FastAPI Backend → SQLAlchemy → PostgreSQL/SQLite
```

---

## Step 1: Set Up FastAPI Project

Create a new directory for your backend:

```bash
# In a separate location
mkdir flatmate-backend
cd flatmate-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic bcrypt python-jose[cryptography] python-multipart
```

### Project Structure

```
flatmate-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── dependencies.py      # Auth dependencies
│   ├── security.py          # Password hashing, JWT
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Registration, login
│   │   ├── tasks.py          # Task CRUD
│   │   ├── houses.py         # House management
│   │   └── flatmates.py      # Flatmate management
│   └── middleware.py         # CORS, etc.
├── requirements.txt
└── .env
```

---

## Step 2: Database Setup

### Option A: SQLite (Simpler, for development)

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./flatmate.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

### Option B: PostgreSQL (Production-ready)

```python
# app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/dbname")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

---

## Step 3: Database Models (SQLAlchemy)

### `app/models.py`

```python
from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_tasks = relationship("Task", foreign_keys="Task.creator_id", back_populates="creator")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")
    flatmates = relationship("Flatmate", back_populates="user")
    flatmate_house = relationship("FlatmateHouse", uselist=False, back_populates="creator")


class FlatmateHouse(Base):
    __tablename__ = "flatmate_houses"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    creator_id = Column(String, ForeignKey("users.id"), unique=True)
    creator = relationship("User", back_populates="flatmate_house")
    
    flatmates = relationship("Flatmate", back_populates="house")
    tasks = relationship("Task", back_populates="house")


class Flatmate(Base):
    __tablename__ = "flatmates"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    house_id = Column(String, ForeignKey("flatmate_houses.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="member")
    
    user = relationship("User", back_populates="flatmates")
    house = relationship("FlatmateHouse", back_populates="flatmates")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="medium")
    status = Column(String, default="pending")
    completed = Column(Boolean, default=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Task assignment
    assignee_id = Column(String, ForeignKey("users.id"), nullable=True)
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_tasks")
    
    house_id = Column(String, ForeignKey("flatmate_houses.id"), nullable=False)
    house = relationship("FlatmateHouse", back_populates="tasks")
    
    # Notifications
    reminder_enabled = Column(Boolean, default=False)
    reminder_interval = Column(Integer, nullable=True)
    last_reminder_sent = Column(DateTime(timezone=True), nullable=True)
    
    # Recurring tasks
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True)
    recurrence_end_date = Column(DateTime(timezone=True), nullable=True)
    parent_task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    parent_task = relationship("Task", remote_side=[id])
```

---

## Step 4: Pydantic Schemas

### `app/schemas.py`

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    house_id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completed: Optional[bool] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    priority: str
    status: str
    completed: bool
    due_date: Optional[datetime]
    assignee_id: Optional[str]
    creator_id: str
    house_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# House Schemas
class HouseCreate(BaseModel):
    name: str

class HouseResponse(BaseModel):
    id: str
    name: str
    code: str
    creator_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
```

---

## Step 5: Security & Authentication

### `app/security.py`

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### `app/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import SessionLocal
from app.security import decode_access_token
from app.schemas import UserResponse

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    return user_id
```

---

## Step 6: API Routes

### `app/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token
from app.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        id=str(uuid.uuid4()),
        name=user.name,
        email=user.email,
        password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=60 * 24 * 7)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
```

### `app/routers/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskResponse
import uuid

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    house_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.house_id == house_id).all()
    return tasks

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    new_task = Task(
        id=str(uuid.uuid4()),
        title=task.title,
        description=task.description,
        priority=task.priority,
        assignee_id=task.assignee_id,
        due_date=task.due_date,
        house_id=task.house_id,
        creator_id=user_id
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted"}
```

---

## Step 7: Main App

### `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, tasks, houses, flatmates

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flatmate API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(houses.router)
app.include_router(flatmates.router)

@app.get("/")
def root():
    return {"message": "Flatmate API is running!"}
```

---

## Step 8: Run the Backend

```bash
# Install additional dependency
pip install passlib[bcrypt]

# Run the server
uvicorn app.main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`

API docs: `http://localhost:8000/docs`

---

## Step 9: Update Frontend to Use FastAPI

In your Next.js frontend, update API calls:

### Before (Next.js API):
```typescript
const res = await fetch('/api/tasks', { method: 'POST', ... })
```

### After (FastAPI):
```typescript
const res = await fetch('http://localhost:8000/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(data)
})
```

---

## Environment Variables

Create `.env` in the backend folder:

```env
DATABASE_URL=sqlite:///./flatmate.db
# OR for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost/flatmate_db

SECRET_KEY=your-secret-key-change-this
```

---

## Complete Requirements File

### `requirements.txt`

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

---

## Database Migration

For SQLite, tables are created automatically. For PostgreSQL:

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

---

## Testing the API

Use the FastAPI docs at `http://localhost:8000/docs` or curl:

```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Get tasks (with token)
curl "http://localhost:8000/api/tasks/?house_id=abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

1. ✅ Complete all routers (houses, flatmates)
2. ✅ Add notification system
3. ✅ Implement recurring tasks
4. ✅ Deploy backend separately
5. ✅ Update frontend to call FastAPI endpoints

This gives you a complete, separate backend using FastAPI + SQL!


