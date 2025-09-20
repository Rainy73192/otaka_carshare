#!/bin/bash

echo "🚀 启动 Otaka 租车业务系统..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "📦 构建和启动服务..."
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "   前端应用: http://localhost:3001"
echo "   后端 API: http://localhost:8001"
echo "   API 文档: http://localhost:8001/docs"
echo "   MinIO 控制台: http://localhost:9001"
echo ""
echo "👤 默认管理员账户："
echo "   邮箱: admin@otaka.com"
echo "   密码: admin123"
echo ""
echo "🔧 管理命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
