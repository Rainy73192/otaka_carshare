from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import create_access_token, verify_token
from app.core.config import settings
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse, EmailVerificationRequest, EmailVerificationResponse, VerifyEmailRequest
from app.services.user_service import UserService
from app.core.minio_client import minio_client
import uuid
import io

router = APIRouter()

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    try:
        user = user_service.create_user(user_data)
        return user
    except HTTPException as e:
        # 如果是200状态码，说明是重新发送验证邮件
        if e.status_code == 200:
            return {"message": e.detail, "email": user_data.email}
        # 其他错误直接抛出
        raise e

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/admin/login", response_model=Token)
def admin_login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.authenticate_user(user_credentials.email, user_credentials.password)
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password, or not an admin",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": True}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.get_user_by_email(token_data["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/upload-license")
def upload_driver_license(
    file: UploadFile = File(...),
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    print("=== UPLOAD START ===")
    print(f"File: {file.filename}")
    print(f"Content type: {file.content_type}")
    
    # Check if file is an image
    if not file.content_type.startswith("image/"):
        print("ERROR: Not an image file")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Check file size (max 5MB)
    file_content = file.file.read()
    print(f"File size: {len(file_content)} bytes")
    if len(file_content) > 5 * 1024 * 1024:
        print("ERROR: File too large")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large (max 5MB)"
        )

    # Generate unique filename
    if not file.filename:
        file.filename = "uploaded_file"
    
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    print(f"Generated filename: {unique_filename}")
    
    try:
        print("=== MINIO UPLOAD ===")
        # Upload to MinIO
        file_url = minio_client.upload_file(
            file_content,
            unique_filename,
            file.content_type
        )
        print(f"MinIO upload successful: {file_url}")
        
        print("=== DATABASE SAVE ===")
        # Save to database
        user_service = UserService(db)
        user = user_service.get_user_by_email(token_data["sub"])
        print(f"User found: {user.id}")
        
        from app.schemas.user import DriverLicenseCreate
        print(f"Creating DriverLicenseCreate with:")
        print(f"  file_name: {unique_filename}")
        print(f"  file_url: {file_url}")
        print(f"  file_size: {len(file_content)}")
        print(f"  content_type: {file.content_type}")
        
        license_data = DriverLicenseCreate(
            file_name=unique_filename,
            file_url=file_url,
            file_size=len(file_content),
            content_type=file.content_type
        )
        print(f"DriverLicenseCreate created successfully: {license_data}")
        print(f"DriverLicenseCreate.file_name: {license_data.file_name}")
        
        driver_license = user_service.create_driver_license(user.id, license_data)
        print(f"Driver license saved: {driver_license.id}")
        
        return {
            "message": "Driver license uploaded successfully",
            "license_id": driver_license.id,
            "file_url": file_url
        }
        
    except HTTPException as e:
        # Re-raise HTTPException as-is
        raise e
    except Exception as e:
        print(f"=== EXCEPTION CAUGHT ===")
        print(f"Exception type: {type(e)}")
        print(f"Exception value: {repr(e)}")
        print(f"Exception str: {str(e)}")
        import traceback
        traceback.print_exc()
        
        error_msg = str(e) if str(e) else f"Unknown error: {type(e)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {error_msg}"
        )

@router.get("/files/{bucket_name}/{file_name}")
def get_file(bucket_name: str, file_name: str, db: Session = Depends(get_db)):
    """Proxy endpoint to serve files from MinIO"""
    try:
        # Get file from MinIO
        response = minio_client.client.get_object(bucket_name, file_name)
        file_data = response.read()
        
        # Determine content type
        content_type = "application/octet-stream"
        if file_name.lower().endswith(('.jpg', '.jpeg')):
            content_type = "image/jpeg"
        elif file_name.lower().endswith('.png'):
            content_type = "image/png"
        elif file_name.lower().endswith('.gif'):
            content_type = "image/gif"
        elif file_name.lower().endswith('.webp'):
            content_type = "image/webp"
        
        # Return file as streaming response
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={file_name}",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        print(f"Error serving file {bucket_name}/{file_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

@router.post("/verify-email", response_model=EmailVerificationResponse)
def verify_email(verify_data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """验证邮箱地址"""
    user_service = UserService(db)
    success = user_service.verify_email(verify_data.token)
    
    if success:
        return EmailVerificationResponse(
            message="邮箱验证成功！您现在可以登录了。",
            email="verified@example.com"  # 临时邮箱，因为验证成功后不需要返回真实邮箱
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证链接无效或已过期"
        )

@router.post("/resend-verification", response_model=EmailVerificationResponse)
def resend_verification_email(request: EmailVerificationRequest, db: Session = Depends(get_db)):
    """重新发送验证邮件"""
    user_service = UserService(db)
    success = user_service.resend_verification_email(request.email)
    
    if success:
        return EmailVerificationResponse(
            message="验证邮件已重新发送，请检查您的邮箱。",
            email=request.email
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱不存在或已验证"
        )
