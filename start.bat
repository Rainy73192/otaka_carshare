@echo off
echo 🚀 启动 Otaka 租车业务系统...

REM 检查 Docker 是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未运行，请先启动 Docker
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

echo 📦 构建和启动服务...
docker-compose up --build -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...
docker-compose ps

echo.
echo ✅ 服务启动完成！
echo.
echo 🌐 访问地址：
echo    前端应用: http://localhost:3001
echo    后端 API: http://localhost:8001
echo    API 文档: http://localhost:8001/docs
echo    MinIO 控制台: http://localhost:9001
echo.
echo 👤 默认管理员账户：
echo    邮箱: admin@otaka.com
echo    密码: admin123
echo.
echo 🔧 管理命令：
echo    查看日志: docker-compose logs -f
echo    停止服务: docker-compose down
echo    重启服务: docker-compose restart
echo.
pause
