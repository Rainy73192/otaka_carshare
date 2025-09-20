from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.user import User, DriverLicense
from app.schemas.user import UserCreate, UserLogin, DriverLicenseCreate, DriverLicenseUpdate
from app.core.security import verify_password, get_password_hash
from app.core.config import settings
from app.core.email import EmailService
from typing import List, Optional
import uuid
import asyncio

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Send welcome email asynchronously
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(EmailService.send_welcome_email(db_user.email))
            loop.close()
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        return db_user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_all_users(self) -> List[User]:
        return self.db.query(User).all()
    
    def create_driver_license(self, user_id: int, license_data: DriverLicenseCreate) -> DriverLicense:
        print(f"Creating driver license for user_id: {user_id}")
        print(f"License data type: {type(license_data)}")
        print(f"License data: {license_data}")
        
        # Check if user already has a license
        existing_license = self.db.query(DriverLicense).filter(DriverLicense.user_id == user_id).first()
        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver license already exists for this user"
            )
        
        print(f"Creating DriverLicense object with file_name: {license_data.file_name}")
        db_license = DriverLicense(
            user_id=user_id,
            file_name=license_data.file_name,
            file_url=license_data.file_url,
            file_size=license_data.file_size,
            content_type=license_data.content_type
        )
        self.db.add(db_license)
        self.db.commit()
        self.db.refresh(db_license)
        
        # Send notification to admin
        try:
            user = self.get_user_by_id(user_id)
            print(f"User found: {user}")
            if user:
                print(f"User email: {user.email}")
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(EmailService.send_license_uploaded_notification(
                settings.ADMIN_EMAIL, 
                user.email if user else "unknown@example.com", 
                user_id
            ))
            loop.close()
        except Exception as e:
            print(f"Failed to send license notification: {e}")
            import traceback
            traceback.print_exc()
        
        return db_license
    
    def get_driver_license_by_user(self, user_id: int) -> Optional[DriverLicense]:
        return self.db.query(DriverLicense).filter(DriverLicense.user_id == user_id).first()
    
    def get_all_driver_licenses(self) -> List[DriverLicense]:
        return self.db.query(DriverLicense).all()
    
    def get_all_driver_licenses_with_users(self) -> List[tuple]:
        return self.db.query(DriverLicense, User).join(User, DriverLicense.user_id == User.id).all()
    
    def update_driver_license_status(self, license_id: int, update_data: DriverLicenseUpdate) -> DriverLicense:
        license_record = self.db.query(DriverLicense).filter(DriverLicense.id == license_id).first()
        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver license not found"
            )
        
        old_status = license_record.status
        license_record.status = update_data.status
        license_record.admin_notes = update_data.admin_notes
        self.db.commit()
        self.db.refresh(license_record)
        
        # Send email notification based on status change
        try:
            user = self.get_user_by_id(license_record.user_id)
            if user:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                if update_data.status == "approved":
                    loop.run_until_complete(EmailService.send_license_approved_email(user.email))
                elif update_data.status == "rejected":
                    loop.run_until_complete(EmailService.send_license_rejected_email(
                        user.email, 
                        update_data.admin_notes
                    ))
                
                loop.close()
        except Exception as e:
            print(f"Failed to send status email: {e}")
        
        return license_record
    
    def get_driver_license_with_user(self, license_id: int):
        return self.db.query(DriverLicense, User).join(User, DriverLicense.user_id == User.id).filter(DriverLicense.id == license_id).first()
    
    def get_all_driver_licenses_with_users(self):
        return self.db.query(DriverLicense, User).join(User, DriverLicense.user_id == User.id).all()
