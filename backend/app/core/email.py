from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from app.core.email_templates import email_template_manager
from typing import List
import asyncio

# Email configuration - 检查是否配置了真实的邮件服务
def check_email_config():
    return (settings.MAIL_USERNAME != "your-email@gmail.com" and 
            settings.MAIL_PASSWORD != "your-app-password")

EMAIL_ENABLED = check_email_config()

if EMAIL_ENABLED:
    # 配置了真实的邮件服务
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )
    fastmail = FastMail(conf)
    print("✅ 邮件功能已启用")
else:
    # 使用默认配置，邮件功能被禁用
    fastmail = None
    print("⚠️  邮件功能未配置，将跳过邮件发送")

class EmailService:
    @staticmethod
    async def send_welcome_email(user_email: str, user_name: str = None, language: str = "zh-CN"):
        """Send welcome email to new user"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送欢迎邮件到: {user_email} (语言: {language})")
            return True
        
        try:
            # 获取基础URL（从环境变量或配置中）
            base_url = settings.BASE_URL
            
            # 使用模板管理器渲染邮件
            subject, html_content = email_template_manager.render_welcome_email(language, base_url)
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await fastmail.send_message(message)
            print(f"✅ 欢迎邮件发送成功: {user_email} (语言: {language})")
            return True
        except Exception as e:
            print(f"Error sending welcome email: {e}")
            return False
    
    @staticmethod
    async def send_license_uploaded_notification(admin_email: str, user_email: str, user_id: int, language: str = "zh-CN"):
        """Send notification to admin when user uploads license"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照上传通知到管理员: {admin_email} (语言: {language})")
            return True
            
        try:
            # 获取基础URL
            base_url = settings.BASE_URL
            
            # 使用模板管理器渲染邮件
            subject, html_content = email_template_manager.render_admin_notification_email(
                language, base_url, user_email, datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            )
            
            message = MessageSchema(
                subject=subject,
                recipients=[admin_email],
                body=html_content,
                subtype="html"
            )
            
            await fastmail.send_message(message)
            print(f"✅ 驾照通知邮件发送成功: {admin_email} (语言: {language})")
            return True
        except Exception as e:
            print(f"Error sending license notification: {e}")
            return False
    
    @staticmethod
    async def send_license_approved_email(user_email: str, language: str = "zh-CN"):
        """Send email to user when license is approved"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照通过邮件到: {user_email} (语言: {language})")
            return True
            
        try:
            # 获取基础URL
            base_url = settings.BASE_URL
            
            # 使用模板管理器渲染邮件
            subject, html_content = email_template_manager.render_license_approved_email(language, base_url)
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            await fastmail.send_message(message)
            return True
        except Exception as e:
            print(f"Error sending approval email: {e}")
            return False
    
    @staticmethod
    async def send_license_rejected_email(user_email: str, reason: str = None, language: str = "zh-CN"):
        """Send email to user when license is rejected"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照拒绝邮件到: {user_email} (语言: {language})")
            return True
            
        try:
            # 获取基础URL
            base_url = settings.BASE_URL
            
            # 使用模板管理器渲染邮件
            subject, html_content = email_template_manager.render_license_rejected_email(language, base_url, reason or "")
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            await fastmail.send_message(message)
            return True
        except Exception as e:
            print(f"Error sending rejection email: {e}")
            return False
    
    @staticmethod
    async def send_verification_email(user_email: str, verification_token: str, language: str = "zh-CN"):
        """Send email verification email"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送验证邮件到: {user_email} (语言: {language})")
            print(f"📧 [模拟] 验证链接: {settings.BASE_URL}/verify-email?token={verification_token}")
            return True
        
        try:
            # 获取基础URL
            base_url = settings.BASE_URL
            verification_url = f"{base_url}/{language}/verify-email?token={verification_token}"
            
            # 使用模板管理器渲染邮件
            subject, html_content = email_template_manager.render_verification_email(language, verification_url)
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await fastmail.send_message(message)
            print(f"✅ 验证邮件发送成功: {user_email} (语言: {language})")
            return True
        except Exception as e:
            print(f"发送验证邮件失败: {e}")
            return False