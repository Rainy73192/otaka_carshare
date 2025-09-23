@echo off
echo ========================================
echo 快速启动 ngrok + Docker
echo ========================================

REM 停止现有服务
echo 停止现有服务...
docker-compose down

REM 启动 ngrok (后台)
echo 启动 ngrok...
start /B ngrok http 3001

REM 等待 ngrok 启动
echo 等待 ngrok 启动...
timeout /t 3 /nobreak >nul

REM 获取 ngrok URL 并更新配置
echo 获取 ngrok URL...
for /f "tokens=*" %%i in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do (
    for /f "tokens=2 delims=:" %%a in ("%%i") do (
        set "url=%%a"
    )
)

REM 清理 URL
set "url=%url:"=%"
set "url=%url:,=%"
set "url=%url: =%"

echo 使用 ngrok URL: %url%

REM 更新 docker-compose.yml
powershell -Command "(Get-Content 'docker-compose.yml') -replace 'BASE_URL: https://[^/\s]+', 'BASE_URL: %url%' | Set-Content 'docker-compose.yml'"

REM 启动 Docker
echo 启动 Docker 服务...
docker-compose up -d

echo ========================================
echo 启动完成！
echo ========================================
echo 前端地址: %url%
echo 后端地址: %url%:8001
echo ========================================
pause
