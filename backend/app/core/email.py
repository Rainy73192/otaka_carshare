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
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:3001')
            
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
    async def send_license_uploaded_notification(admin_email: str, user_email: str, user_id: int):
        """Send notification to admin when user uploads license"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照上传通知到管理员: {admin_email}")
            return True
            
        subject = "新驾照上传通知 - 需要审核"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">📋 新驾照上传通知</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">管理员您好，</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    用户 <strong>{user_email}</strong> (ID: {user_id}) 刚刚上传了驾照照片，需要您进行审核。
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #374151; margin-top: 0;">审核信息：</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li><strong>用户邮箱：</strong> {user_email}</li>
                        <li><strong>用户ID：</strong> {user_id}</li>
                        <li><strong>上传时间：</strong> {asyncio.get_event_loop().time()}</li>
                        <li><strong>状态：</strong> 待审核</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3001/admin" 
                       style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        立即审核
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    请及时处理审核请求，确保用户体验。
                </p>
            </div>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=subject,
            recipients=[admin_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await fastmail.send_message(message)
            return True
        except Exception as e:
            print(f"Error sending license notification: {e}")
            return False
    
    @staticmethod
    async def send_license_approved_email(user_email: str):
        """Send email to user when license is approved"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照通过邮件到: {user_email}")
            return True
            
        subject = "驾照审核通过 - Otaka 租车系统"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🎉 恭喜！驾照审核通过</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">亲爱的用户，</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    您上传的驾照已通过审核！现在您可以开始使用我们的租车服务了。
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                    <h3 style="color: #374151; margin-top: 0;">您现在可以：</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>浏览可用的车辆</li>
                        <li>预约租车时间</li>
                        <li>享受便捷的租车服务</li>
                        <li>获得专业的客户支持</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3001/dashboard" 
                       style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        开始租车
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    感谢您选择 Otaka 租车服务！
                </p>
            </div>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
            await fastmail.send_message(message)
            return True
        except Exception as e:
            print(f"Error sending approval email: {e}")
            return False
    
    @staticmethod
    async def send_license_rejected_email(user_email: str, reason: str = None):
        """Send email to user when license is rejected"""
        if not EMAIL_ENABLED:
            print(f"📧 [模拟] 发送驾照拒绝邮件到: {user_email}")
            return True
            
        subject = "驾照审核结果 - 需要重新上传"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">📋 驾照审核结果</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">亲爱的用户，</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    很抱歉，您上传的驾照照片未能通过审核。请根据以下要求重新上传：
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <h3 style="color: #374151; margin-top: 0;">上传要求：</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>照片清晰，无模糊</li>
                        <li>信息完整，无遮挡</li>
                        <li>格式为 JPG 或 PNG</li>
                        <li>文件大小不超过 5MB</li>
                    </ul>
                    {f'<p style="color: #ef4444; font-weight: bold; margin-top: 15px;">拒绝原因：{reason}</p>' if reason else ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3001/dashboard" 
                       style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        重新上传
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    如有疑问，请联系我们的客服团队。
                </p>
            </div>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=subject,
            recipients=[user_email],
            body=html_content,
            subtype="html"
        )
        
        try:
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
            print(f"📧 [模拟] 验证链接: http://localhost:3001/verify-email?token={verification_token}")
            return True
        
        try:
            # 获取基础URL
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:3001')
            verification_url = f"{base_url}/verify-email?token={verification_token}"
            
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