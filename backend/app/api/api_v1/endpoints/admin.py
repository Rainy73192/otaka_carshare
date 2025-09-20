from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.user import UserResponse, DriverLicenseResponse, DriverLicenseUpdate
from app.services.user_service import UserService

router = APIRouter()

def verify_admin(token_data: dict = Depends(verify_token)):
    if not token_data.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return token_data

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.get_all_users()

@router.get("/driver-licenses", response_model=List[DriverLicenseResponse])
def get_all_driver_licenses(
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.get_all_driver_licenses()

@router.put("/driver-licenses/{license_id}")
def update_driver_license_status(
    license_id: int,
    update_data: DriverLicenseUpdate,
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    license_record = user_service.update_driver_license_status(license_id, update_data)
    return {"message": "Driver license status updated successfully", "license": license_record}

@router.get("/driver-licenses/{license_id}")
def get_driver_license_details(
    license_id: int,
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    result = user_service.get_driver_license_with_user(license_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver license not found"
        )
    
    license_record, user = result
    return {
        "license": license_record,
        "user": user
    }
