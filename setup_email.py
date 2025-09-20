#!/usr/bin/env python3
"""
邮件配置设置脚本
"""
import os

def setup_gmail():
    print("📧 配置 Gmail 邮件服务")
    print("=" * 50)
    
    print("\n步骤 1: 启用 Gmail 两步验证")
    print("1. 登录您的 Gmail 账户")
    print("2. 访问: https://myaccount.google.com/security")
    print("3. 启用 '两步验证'")
    
    print("\n步骤 2: 生成应用专用密码")
    print("1. 在 '安全性' 页面找到 '应用专用密码'")
    print("2. 选择 '邮件' 和 '其他设备'")
    print("3. 输入应用名称: 'Otaka 租车系统'")
    print("4. 复制生成的 16 位密码")
    
    print("\n步骤 3: 更新配置")
    email = input("\n请输入您的 Gmail 地址: ")
    password = input("请输入应用专用密码: ")
    
    # 更新 docker-compose.yml
    docker_compose_content = f"""version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: otaka_carshare
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - otaka_network

  # MinIO 对象存储
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - otaka_network

  # FastAPI 后端
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/otaka_carshare
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      JWT_SECRET_KEY: your-super-secret-jwt-key-change-in-production
      JWT_ALGORITHM: HS256
      JWT_ACCESS_TOKEN_EXPIRE_MINUTES: 30
      ADMIN_EMAIL: admin@otaka.com
      ADMIN_PASSWORD: admin123
      # Email settings - 已配置
      MAIL_USERNAME: {email}
      MAIL_PASSWORD: {password}
      MAIL_FROM: {email}
      MAIL_FROM_NAME: Otaka 租车系统
      MAIL_PORT: 587
      MAIL_SERVER: smtp.gmail.com
      MAIL_STARTTLS: true
      MAIL_SSL_TLS: false
      MAIL_USE_CREDENTIALS: true
      MAIL_VALIDATE_CERTS: true
    ports:
      - "8001:8000"
    depends_on:
      - postgres
      - minio
    networks:
      - otaka_network
    command: >
      sh -c "
        python init_admin.py &&
        uvicorn app.main:app --host 0.0.0.0 --port 8000
      "

  # Next.js 前端
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8001
    ports:
      - "3001:3000"
    depends_on:
      - backend
    networks:
      - otaka_network

volumes:
  postgres_data:
  minio_data:

networks:
  otaka_network:
    driver: bridge"""
    
    with open('docker-compose.yml', 'w', encoding='utf-8') as f:
        f.write(docker_compose_content)
    
    print(f"\n✅ 配置已更新！")
    print(f"📧 邮件地址: {email}")
    print(f"🔧 下一步: 运行 'docker-compose up -d' 重启服务")

def setup_other_email():
    print("📧 配置其他邮件服务")
    print("=" * 50)
    print("\n支持的邮件服务商:")
    print("1. QQ 邮箱")
    print("2. 163 邮箱") 
    print("3. Outlook/Hotmail")
    print("4. 企业邮箱")
    
    choice = input("\n请选择邮件服务商 (1-4): ")
    
    if choice == "1":
        print("\nQQ 邮箱配置:")
        print("SMTP 服务器: smtp.qq.com")
        print("端口: 587")
        print("需要开启 SMTP 服务并获取授权码")
    elif choice == "2":
        print("\n163 邮箱配置:")
        print("SMTP 服务器: smtp.163.com")
        print("端口: 465")
        print("需要开启 SMTP 服务并获取授权码")
    elif choice == "3":
        print("\nOutlook 配置:")
        print("SMTP 服务器: smtp-mail.outlook.com")
        print("端口: 587")
        print("使用您的 Outlook 密码")
    else:
        print("\n请查看 EMAIL_SETUP.md 了解详细配置步骤")

if __name__ == "__main__":
    print("🚀 Otaka 租车系统 - 邮件配置向导")
    print("=" * 50)
    
    print("\n选择配置方式:")
    print("1. Gmail (推荐)")
    print("2. 其他邮件服务")
    print("3. 查看配置说明")
    
    choice = input("\n请选择 (1-3): ")
    
    if choice == "1":
        setup_gmail()
    elif choice == "2":
        setup_other_email()
    elif choice == "3":
        print("\n📖 详细配置说明请查看 EMAIL_SETUP.md 文件")
    else:
        print("❌ 无效选择")
