#!/bin/bash

echo "🌐 设置 ngrok 隧道..."

echo "1. 请先下载并安装 ngrok"
echo "   访问: https://ngrok.com/download"
echo ""
echo "2. 注册免费账号并获取 token"
echo "   访问: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""

read -p "请输入你的 ngrok token: " token
ngrok config add-authtoken $token

echo ""
echo "4. 启动本地服务..."
docker-compose up -d backend postgres minio
sleep 10

docker-compose up -d frontend
sleep 15

echo ""
echo "5. 启动 ngrok 隧道..."
echo "正在启动 ngrok，请稍等..."
ngrok http 3001 &

echo ""
echo "✅ 设置完成！"
echo ""
echo "📱 访问地址:"
echo "- 本地前端: http://localhost:3001"
echo "- 本地后端: http://localhost:8001"
echo "- ngrok 隧道: 查看 ngrok 窗口中的 https://xxx.ngrok.io"
echo ""
echo "🔐 管理员账户:"
echo "- 邮箱: admin@otaka.com"
echo "- 密码: admin123"
echo ""
echo "📝 重要提示:"
echo "1. 复制 ngrok 提供的外网地址"
echo "2. 将地址发送给客户查看"
echo "3. 地址格式类似: https://abc123.ngrok.io"
