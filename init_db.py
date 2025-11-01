#!/usr/bin/env python3
"""
Database initialization script
Run this to create all database tables
"""

from app.db.session import engine
from app.models import user, house, house_member, task

def init_db():
    """Create all database tables"""
    print("Creating database tables...")

    # Create all tables
    user.Base.metadata.create_all(bind=engine)
    house.Base.metadata.create_all(bind=engine)
    house_member.Base.metadata.create_all(bind=engine)
    task.Base.metadata.create_all(bind=engine)

    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    init_db()
