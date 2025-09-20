# Demo 部署指南

## 🎯 目标
在本地部署项目，让外网客户可以访问查看demo。

## 🚀 推荐方案：ngrok（最简单）

### 优势
- ✅ 完全免费
- ✅ 一键启动
- ✅ 自动HTTPS
- ✅ 无需配置路由器
- ✅ 适合demo展示

### 快速开始

#### Windows 用户
```bash
# 1. 运行自动设置脚本
ngrok-setup.bat

# 2. 或者手动启动
start-demo.bat
```

#### Linux/Mac 用户
```bash
# 1. 给脚本执行权限
chmod +x ngrok-setup.sh
chmod +x start-demo.sh

# 2. 运行自动设置脚本
./ngrok-setup.sh

# 3. 或者手动启动
./start-demo.sh
```

### 手动设置步骤

1. **下载 ngrok**
   - 访问：https://ngrok.com/download
   - 下载对应版本

2. **注册账号**
   - 访问：https://dashboard.ngrok.com/signup
   - 获取免费token

3. **配置 ngrok**
   ```bash
   # 配置token
   ngrok config add-authtoken YOUR_TOKEN
   ```

4. **启动本地服务**
   ```bash
   # 启动所有服务
   docker-compose up -d
   ```

5. **启动 ngrok 隧道**
   ```bash
   # 创建隧道
   ngrok http 3001
   ```

6. **获取外网地址**
   - ngrok 会显示类似：`https://abc123.ngrok.io`
   - 这就是客户可以访问的地址

## 🌐 其他方案

### 方案二：Cloudflare Tunnel
- 更稳定，适合长期使用
- 需要域名
- 详见：`setup-cloudflare-tunnel.md`

### 方案三：本地网络
- 需要路由器配置
- 需要公网IP
- 详见：`setup-local-network.md`

## 📱 访问地址

### 本地访问
- 前端：http://localhost:3001
- 后端API：http://localhost:8001
- 数据库：localhost:5433
- MinIO控制台：http://localhost:9001

### 外网访问（ngrok）
- 前端：https://abc123.ngrok.io
- 后端API：https://abc123.ngrok.io/api

## 🔐 管理员账户

- **邮箱**：admin@otaka.com
- **密码**：admin123

## 🌍 多语言支持

客户可以通过以下URL访问不同语言版本：

- **简体中文**：https://abc123.ngrok.io/zh-CN
- **繁體中文**：https://abc123.ngrok.io/zh-TW
- **English**：https://abc123.ngrok.io/en
- **日本語**：https://abc123.ngrok.io/ja

## 📋 Demo 展示要点

### 功能演示
1. **用户注册**：展示邮箱验证流程
2. **多语言切换**：展示国际化功能
3. **驾照上传**：展示文件上传功能
4. **管理后台**：展示管理员功能

### 技术亮点
1. **响应式设计**：适配各种设备
2. **国际化支持**：四种语言
3. **邮箱验证**：完整的验证流程
4. **文件管理**：MinIO对象存储
5. **API文档**：https://abc123.ngrok.io/docs

## ⚠️ 注意事项

1. **ngrok 免费版限制**：
   - 每次重启地址会变化
   - 有连接数限制
   - 适合短期demo

2. **安全性**：
   - 仅用于demo展示
   - 不要在生产环境使用
   - 定期更换密码

3. **性能**：
   - 本地网络可能较慢
   - 建议优化图片大小
   - 使用CDN加速

## 🔧 故障排除

### 常见问题

1. **ngrok 连接失败**
   - 检查token是否正确
   - 确认网络连接正常

2. **服务无法启动**
   - 检查端口是否被占用
   - 查看Docker日志

3. **外网无法访问**
   - 确认ngrok隧道已启动
   - 检查防火墙设置

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 📞 客户支持

如果客户遇到问题，可以提供：

1. **访问地址**：ngrok提供的HTTPS地址
2. **管理员账户**：admin@otaka.com / admin123
3. **API文档**：https://abc123.ngrok.io/docs
4. **多语言支持**：在URL后添加语言代码

## 🎉 完成！

现在你的demo已经可以在外网访问了！客户可以通过ngrok提供的地址查看你的项目。
