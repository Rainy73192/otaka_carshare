from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DriverLicenseBase(BaseModel):
    pass

class DriverLicenseCreate(DriverLicenseBase):
    file_name: str
    file_url: str
    file_size: int
    content_type: str
    license_type: str  # front, back

class DriverLicenseResponse(DriverLicenseBase):
    id: int
    user_id: int
    file_name: str
    file_url: str
    file_size: int
    content_type: str
    license_type: str
    status: str
    created_at: datetime
    admin_notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class DriverLicenseUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class DriverLicenseWithUserResponse(DriverLicenseResponse):
    user: UserResponse

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class EmailVerificationResponse(BaseModel):
    message: str
    email: EmailStr

class VerifyEmailRequest(BaseModel):
    token: str