@echo off
echo 🚀 启动 Demo 环境...

REM 启动本地服务
echo 启动本地服务...
start "Backend" cmd /k "docker-compose up backend postgres minio"
timeout /t 10 /nobreak

echo 启动前端服务...
start "Frontend" cmd /k "docker-compose up frontend"
timeout /t 15 /nobreak

echo 启动 ngrok 隧道...
echo 请确保已安装 ngrok 并配置了 token
echo 运行命令: ngrok http 3001
echo.
echo 本地访问地址:
echo - 前端: http://localhost:3001
echo - 后端API: http://localhost:8001
echo - 数据库: localhost:5433
echo - MinIO控制台: http://localhost:9001
echo.
echo 管理员账户:
echo - 邮箱: admin@otaka.com
echo - 密码: admin123
echo.
echo 获取外网访问地址后，请更新前端配置中的 API URL
pause
