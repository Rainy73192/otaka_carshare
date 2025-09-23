from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.user import UserResponse, DriverLicenseUpdate, EmailVerificationRequest
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

@router.get("/driver-licenses", response_model=List[dict])
def get_all_driver_licenses(
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    results = user_service.get_all_driver_licenses_with_users()
    
    # Group licenses by user_id
    user_licenses = {}
    for license_record, user in results:
        user_id = license_record.user_id
        if user_id not in user_licenses:
            user_licenses[user_id] = {
                "user_id": user_id,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "is_active": user.is_active,
                    "is_admin": user.is_admin,
                    "is_verified": user.is_verified,
                    "created_at": user.created_at
                },
                "licenses": {},
                "status": "pending",
                "admin_notes": None,
                "created_at": license_record.created_at
            }
        
        # Add license details
        user_licenses[user_id]["licenses"][license_record.license_type] = {
            "id": license_record.id,
            "file_name": license_record.file_name,
            "file_url": license_record.file_url,
            "file_size": license_record.file_size,
            "content_type": license_record.content_type,
            "license_type": license_record.license_type,
            "status": license_record.status,
            "created_at": license_record.created_at,
            "admin_notes": license_record.admin_notes
        }
        
        # Update overall status (if any license is rejected, mark as rejected)
        if license_record.status == "rejected":
            user_licenses[user_id]["status"] = "rejected"
        elif license_record.status == "approved" and user_licenses[user_id]["status"] != "rejected":
            user_licenses[user_id]["status"] = "approved"
        
        # Use the latest admin_notes
        if license_record.admin_notes:
            user_licenses[user_id]["admin_notes"] = license_record.admin_notes
    
    # Convert to list
    combined_licenses = list(user_licenses.values())
    
    return combined_licenses

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

@router.put("/driver-licenses/{user_id}")
def update_driver_license_status(
    user_id: int,
    update_data: DriverLicenseUpdate,
    token_data: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update all driver licenses for a specific user"""
    user_service = UserService(db)
    
    # Get all licenses for this user
    user_licenses = user_service.get_driver_license_by_user(user_id)
    
    if not user_licenses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No driver licenses found for this user"
        )
    
    # Update all licenses for this user
    updated_licenses = []
    for i, license_record in enumerate(user_licenses):
        # Only send email for the last license record to avoid duplicate emails
        send_email = (i == len(user_licenses) - 1)
        updated_license = user_service.update_driver_license_status(license_record.id, update_data, send_email=send_email)
        updated_licenses.append(updated_license)
    
    return {
        "message": f"All driver licenses for user {user_id} updated successfully", 
        "updated_count": len(updated_licenses),
        "licenses": updated_licenses
    }

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
