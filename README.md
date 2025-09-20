# Otaka 租车业务系统

一个现代化的租车业务管理系统，支持用户注册、驾照上传和管理员审核功能。

## 技术栈

- **前端**: Next.js + TailwindCSS
- **后端**: FastAPI + Python
- **数据库**: PostgreSQL
- **文件存储**: MinIO
- **部署**: Docker + Docker Compose

## 功能特性

### 用户端
- 邮箱注册和登录
- 驾照照片上传
- 响应式设计，支持 PC 和移动端

### 管理端
- 管理员登录
- 查看所有用户信息
- 查看和审核驾照照片

## 快速开始

### 使用 Docker Compose（推荐）

1. 确保已安装 Docker 和 Docker Compose

2. 克隆项目到本地
```bash
git clone <repository-url>
cd otaka_carshare
```

3. 配置邮件服务（可选）
   - 查看 `EMAIL_SETUP.md` 了解详细配置步骤
   - 修改 `docker-compose.yml` 中的邮件配置
   - 如不配置邮件，系统仍可正常运行，但不会发送邮件通知

4. 启动所有服务
```bash
# Windows 用户
start.bat

# Linux/Mac 用户
./start.sh

# 或者直接使用 docker-compose
docker-compose up --build -d
```

5. 访问应用
- 前端应用: http://localhost:3001
- 后端 API: http://localhost:8001
- API 文档: http://localhost:8001/docs
- MinIO 控制台: http://localhost:9001

### 默认账户

- **管理员账户**: 
  - 邮箱: admin@otaka.com
  - 密码: admin123

- **MinIO 控制台**: 
  - 用户名: minioadmin
  - 密码: minioadmin123

- **数据库**:
  - 数据库名: otaka_carshare
  - 用户名: postgres
  - 密码: postgres123

## 使用说明

### 用户端功能
1. **注册账户**: 使用邮箱和密码注册新账户
2. **登录系统**: 使用注册的邮箱和密码登录
3. **上传驾照**: 在用户中心上传驾照照片（支持 JPG、PNG 格式，最大 5MB）
4. **查看状态**: 查看驾照审核状态和结果

### 管理端功能
1. **管理员登录**: 使用管理员账户登录管理后台
2. **用户管理**: 查看所有注册用户信息
3. **驾照审核**: 查看、审核用户上传的驾照照片
4. **状态管理**: 批准或拒绝驾照申请，添加审核备注

### 系统特性
- **响应式设计**: 支持 PC 和移动端浏览器
- **安全认证**: JWT Token 认证机制
- **文件存储**: MinIO 对象存储驾照照片
- **数据持久化**: PostgreSQL 数据库存储用户和业务数据
- **邮件通知**: 自动发送注册确认、审核通知等邮件
- **现代化 UI**: 白色和灰色主题，绿色按钮，立体质感设计

## 项目结构

```
otaka_carshare/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic 模式
│   │   └── services/       # 业务逻辑
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js 前端
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   ├── components/    # React 组件
│   │   └── lib/           # 工具函数
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker 编排文件
└── README.md
```

## 开发说明

### 后端开发
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

## 部署

生产环境部署时，请确保：
1. 修改所有默认密码和密钥
2. 配置正确的环境变量
3. 设置 HTTPS
4. 配置域名和反向代理

## 许可证

MIT License
