@echo off
echo 🔄 重新构建Docker镜像...

echo.
echo 1. 停止所有容器...
docker-compose down

echo.
echo 2. 删除旧镜像...
docker rmi otaka_carshare-backend:latest 2>nul
docker rmi otaka_carshare-frontend:latest 2>nul

echo.
echo 3. 强制重新构建（不使用缓存）...
docker-compose build --no-cache

echo.
echo 4. 启动服务...
docker-compose up -d

echo.
echo ✅ 重新构建完成！
echo.
echo 📱 访问地址:
echo - 前端: http://localhost:3001
echo - 后端: http://localhost:8001
echo - ngrok: 查看ngrok窗口中的 https://xxx.ngrok.io
echo.
pause
