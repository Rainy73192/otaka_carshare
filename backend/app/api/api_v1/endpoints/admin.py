from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.user import UserResponse, DriverLicenseResponse, DriverLicenseUpdate, DriverLicenseWithUserResponse, EmailVerificationRequest
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

@router.get("/driver-licenses", response_model=List[DriverLicenseWithUserResponse])
def get_all_driver_licenses(
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    results = user_service.get_all_driver_licenses_with_users()
    
    # Convert tuple results to the expected format
    licenses_with_users = []
    for license_record, user in results:
        license_with_user = {
            "id": license_record.id,
            "user_id": license_record.user_id,
            "file_name": license_record.file_name,
            "file_url": license_record.file_url,
            "file_size": license_record.file_size,
            "content_type": license_record.content_type,
            "status": license_record.status,
            "created_at": license_record.created_at,
            "admin_notes": license_record.admin_notes,
            "user": {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "created_at": user.created_at
            }
        }
        licenses_with_users.append(license_with_user)
    
        return licenses_with_users

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """删除用户"""
    user_service = UserService(db)
    success = user_service.delete_user(user_id)
    
    if success:
        return {"message": "用户删除成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

@router.delete("/users/by-email")
def delete_user_by_email(
    request: EmailVerificationRequest,
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """通过邮箱删除用户"""
    user_service = UserService(db)
    success = user_service.delete_user_by_email(request.email)
    
    if success:
        return {"message": f"用户 {request.email} 删除成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

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
