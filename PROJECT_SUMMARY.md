# Otaka 租车业务系统 - 项目总结

## 项目概述

这是一个完整的租车业务管理系统，包含用户端和管理端，支持用户注册、驾照上传、管理员审核等功能。系统采用现代化的技术栈，具有良好的用户体验和安全性。

## 技术架构

### 前端技术栈
- **Next.js 14**: React 框架，支持 SSR 和静态生成
- **TypeScript**: 类型安全的 JavaScript
- **TailwindCSS**: 实用优先的 CSS 框架
- **React Hook Form**: 表单管理
- **Axios**: HTTP 客户端
- **React Hot Toast**: 消息提示

### 后端技术栈
- **FastAPI**: 现代、快速的 Python Web 框架
- **SQLAlchemy**: Python SQL 工具包和 ORM
- **PostgreSQL**: 关系型数据库
- **MinIO**: 对象存储服务
- **JWT**: JSON Web Token 认证
- **Pydantic**: 数据验证和设置管理

### 部署技术
- **Docker**: 容器化部署
- **Docker Compose**: 多容器应用编排
- **Nginx**: 反向代理（可选）

## 功能特性

### 用户端功能
1. **用户注册/登录**: 基于邮箱的账户系统
2. **驾照上传**: 支持图片格式，最大 5MB
3. **状态查看**: 实时查看驾照审核状态
4. **响应式设计**: 支持 PC 和移动端

### 管理端功能
1. **管理员登录**: 独立的管理员认证系统
2. **用户管理**: 查看所有注册用户
3. **驾照审核**: 查看、批准或拒绝驾照申请
4. **数据统计**: 用户和审核状态统计

### 系统特性
- **安全性**: JWT Token 认证，密码加密存储
- **可扩展性**: 模块化设计，易于扩展
- **可维护性**: 清晰的代码结构和文档
- **用户体验**: 现代化 UI 设计，流畅的交互

## 项目结构

```
otaka_carshare/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # API 路由
│   │   │   └── api_v1/
│   │   │       └── endpoints/
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic 模式
│   │   └── services/       # 业务逻辑
│   ├── requirements.txt    # Python 依赖
│   ├── Dockerfile         # Docker 配置
│   └── init_admin.py      # 管理员初始化脚本
├── frontend/               # Next.js 前端
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   ├── components/    # React 组件
│   │   └── lib/           # 工具函数
│   ├── package.json       # Node.js 依赖
│   └── Dockerfile         # Docker 配置
├── docker-compose.yml      # Docker 编排文件
├── start.bat              # Windows 启动脚本
├── start.sh               # Linux/Mac 启动脚本
├── test_system.py         # 系统测试脚本
└── README.md              # 项目文档
```

## 部署说明

### 开发环境
1. 确保安装 Docker 和 Docker Compose
2. 克隆项目到本地
3. 运行 `start.bat`（Windows）或 `./start.sh`（Linux/Mac）
4. 访问 http://localhost:3001

### 生产环境
1. 修改默认密码和密钥
2. 配置 HTTPS 和域名
3. 设置数据库备份策略
4. 配置监控和日志

## 默认账户

- **管理员账户**: admin@otaka.com / admin123
- **MinIO 控制台**: minioadmin / minioadmin123
- **数据库**: postgres / postgres123

## 安全考虑

1. **密码安全**: 使用 bcrypt 加密存储
2. **Token 安全**: JWT Token 有过期时间
3. **文件安全**: 文件类型和大小验证
4. **CORS 配置**: 限制跨域访问
5. **输入验证**: 所有输入都经过验证

## 扩展建议

1. **移动端**: 可以开发 React Native 应用
2. **支付系统**: 集成支付网关
3. **车辆管理**: 添加车辆信息管理
4. **预约系统**: 实现车辆预约功能
5. **通知系统**: 添加邮件和短信通知
6. **数据分析**: 添加用户行为分析

## 维护说明

1. **定期备份**: 数据库和文件存储
2. **安全更新**: 及时更新依赖包
3. **监控日志**: 监控系统运行状态
4. **性能优化**: 根据使用情况优化性能

## 技术支持

如有问题，请检查：
1. Docker 容器是否正常运行
2. 端口是否被占用
3. 防火墙设置
4. 系统日志

## 许可证

MIT License
