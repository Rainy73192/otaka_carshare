import json
import os
from typing import Dict, Any

class EmailTemplateManager:
    def __init__(self):
        self.templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'emails')
        self._templates = {}
        self._load_templates()
    
    def _load_templates(self):
        """加载所有语言的邮件模板"""
        languages = ['zh-CN', 'en', 'ja', 'zh-TW']
        
        for lang in languages:
            template_path = os.path.join(self.templates_dir, f'{lang}.json')
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    self._templates[lang] = json.load(f)
                print(f"✅ 加载邮件模板: {lang}")
            except FileNotFoundError:
                print(f"⚠️  邮件模板文件不存在: {lang}")
            except Exception as e:
                print(f"❌ 加载邮件模板失败 {lang}: {e}")
    
    def get_template(self, language: str, template_type: str) -> Dict[str, Any]:
        """获取指定语言和类型的邮件模板"""
        # 如果语言不存在，默认使用中文
        if language not in self._templates:
            language = 'zh-CN'
        
        if template_type not in self._templates[language]:
            raise ValueError(f"邮件模板类型不存在: {template_type}")
        
        return self._templates[language][template_type]
    
    def render_welcome_email(self, language: str, base_url: str) -> tuple[str, str]:
        """渲染欢迎邮件"""
        template = self.get_template(language, 'welcome')
        
        subject = template['subject']
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">{template['title']}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">{template['greeting']}</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    {template['message']}
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                    <h3 style="color: #374151; margin-top: 0;">{template['nextSteps']}</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        {''.join([f'<li>{step}</li>' for step in template['steps']])}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{base_url}" 
                       style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        {template['loginButton']}
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    {template['footer']}
                </p>
            </div>
        </body>
        </html>
        """
        
        return subject, html_content
    
    def render_verification_email(self, language: str, verification_url: str) -> tuple[str, str]:
        """渲染验证邮件"""
        template = self.get_template(language, 'verification')
        
        subject = template['subject']
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">{template['title']}</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin-top: 0;">{template['greeting']}</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    {template['message']}
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        {template['verifyButton']}
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                    {template['fallbackText']}<br>
                    <a href="{verification_url}" style="color: #3b82f6; word-break: break-all;">{verification_url}</a>
                </p>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        <strong>{template['warning']}</strong>
                    </p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                    {template['footer']}
                </p>
            </div>
        </body>
        </html>
        """
        
        return subject, html_content
    
    def render_license_approved_email(self, language: str, base_url: str) -> tuple[str, str]:
        """渲染驾照审核通过邮件"""
        template = self.get_template(language, 'licenseApproved')
        
        subject = template['subject']
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">{template['title']}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">{template['greeting']}</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    {template['message']}
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                    <h3 style="color: #374151; margin-top: 0;">{template['nextSteps']}</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        {''.join([f'<li>{step}</li>' for step in template['steps']])}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{base_url}" 
                       style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        {template['loginButton']}
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    {template['footer']}
                </p>
            </div>
        </body>
        </html>
        """
        
        return subject, html_content
    
    def render_license_rejected_email(self, language: str, base_url: str, reason: str = "") -> tuple[str, str]:
        """渲染驾照审核拒绝邮件"""
        template = self.get_template(language, 'licenseRejected')
        
        subject = template['subject']
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">{template['title']}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">{template['greeting']}</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    {template['message']}
                </p>
                
                {f'<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;"><p style="color: #dc2626; margin: 0; font-size: 14px;"><strong>{template["reason"]}</strong> {reason}</p></div>' if reason else ''}
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <h3 style="color: #374151; margin-top: 0;">{template['nextSteps']}</h3>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        {''.join([f'<li>{step}</li>' for step in template['steps']])}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{base_url}" 
                       style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        {template['uploadButton']}
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                    {template['footer']}
                </p>
            </div>
        </body>
        </html>
        """
        
        return subject, html_content
    
    def render_admin_notification_email(self, language: str, base_url: str, user_email: str, upload_time: str) -> tuple[str, str]:
        """渲染管理员通知邮件"""
        template = self.get_template(language, 'adminNotification')
        
        subject = template['subject']
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">{template['title']}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    {template['message']}
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="color: #374151; margin: 0 0 10px 0;"><strong>{template['userInfo']}</strong> {user_email}</p>
                    <p style="color: #6b7280; margin: 0;"><strong>{template['uploadTime']}</strong> {upload_time}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{base_url}/admin" 
                       style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        {template['reviewButton']}
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        return subject, html_content

# 创建全局实例
email_template_manager = EmailTemplateManager()
