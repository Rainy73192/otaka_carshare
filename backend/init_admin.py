#!/usr/bin/env python3
"""
Initialize admin user for the application
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    """Create admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin_user:
            print(f"Admin user {settings.ADMIN_EMAIL} already exists")
            return
        
        # Create admin user
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            is_admin=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Admin user {settings.ADMIN_EMAIL} created successfully")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
