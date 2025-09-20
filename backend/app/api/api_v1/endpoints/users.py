from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.user import DriverLicenseResponse
from app.services.user_service import UserService

router = APIRouter()


@router.get("/my-license", response_model=List[DriverLicenseResponse])
def get_my_driver_license(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.get_user_by_email(token_data["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    license_records = user_service.get_driver_license_by_user(user.id)
    if not license_records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver license not found"
        )
    
    return license_records

