@echo off
echo ========================================
echo 启动 ngrok 并更新配置
echo ========================================

REM 检查 ngrok 是否已安装
where ngrok >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到 ngrok，请先安装 ngrok
    echo 下载地址: https://ngrok.com/download
    pause
    exit /b 1
)

REM 停止现有的 Docker 服务
echo 停止现有的 Docker 服务...
docker-compose down

REM 启动 ngrok (在后台)
echo 启动 ngrok...
start /B ngrok http 3001

REM 等待 ngrok 启动
echo 等待 ngrok 启动...
timeout /t 5 /nobreak >nul

REM 获取 ngrok URL
echo 获取 ngrok URL...
for /f "tokens=*" %%i in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do (
    set "ngrok_line=%%i"
)

REM 提取 URL
for /f "tokens=2 delims=:" %%a in ("%ngrok_line%") do (
    set "ngrok_url=%%a"
)

REM 清理 URL (移除引号和逗号)
set "ngrok_url=%ngrok_url:"=%"
set "ngrok_url=%ngrok_url:,=%"
set "ngrok_url=%ngrok_url: =%"

if "%ngrok_url%"=="" (
    echo 错误: 无法获取 ngrok URL
    echo 请确保 ngrok 正在运行并且可以访问 http://localhost:4040
    pause
    exit /b 1
)

echo 获取到 ngrok URL: %ngrok_url%

REM 更新 docker-compose.yml 中的 BASE_URL
echo 更新 docker-compose.yml...
powershell -Command "(Get-Content 'docker-compose.yml') -replace 'BASE_URL: https://[^/]+', 'BASE_URL: %ngrok_url%' | Set-Content 'docker-compose.yml'"

REM 启动 Docker 服务
echo 启动 Docker 服务...
docker-compose up -d

echo ========================================
echo 启动完成！
echo ========================================
echo ngrok URL: %ngrok_url%
echo 前端地址: %ngrok_url%
echo 后端地址: %ngrok_url%:8001
echo ========================================
echo 按任意键退出...
pause >nul
