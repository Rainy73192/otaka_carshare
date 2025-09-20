# 邮件配置说明

## 概述

系统已集成邮件发送功能，支持以下邮件类型：
- 用户注册欢迎邮件
- 驾照上传通知邮件（发送给管理员）
- 驾照审核通过邮件
- 驾照审核拒绝邮件

## 配置步骤

### 1. Gmail 配置（推荐）

1. **启用两步验证**
   - 登录 Gmail 账户
   - 进入 "Google 账户" > "安全性"
   - 启用 "两步验证"

2. **生成应用专用密码**
   - 在 "安全性" 页面找到 "应用专用密码"
   - 选择 "邮件" 和 "其他设备"
   - 输入应用名称（如 "Otaka 租车系统"）
   - 复制生成的 16 位密码

3. **更新环境变量**
   ```bash
   # 在 docker-compose.yml 中添加以下环境变量
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-digit-app-password
   MAIL_FROM=your-email@gmail.com
   MAIL_FROM_NAME=Otaka 租车系统
   ```

### 2. 其他邮件服务商配置

#### Outlook/Hotmail
```yaml
MAIL_SERVER: smtp-mail.outlook.com
MAIL_PORT: 587
MAIL_STARTTLS: true
MAIL_SSL_TLS: false
```

#### QQ 邮箱
```yaml
MAIL_SERVER: smtp.qq.com
MAIL_PORT: 587
MAIL_STARTTLS: true
MAIL_SSL_TLS: false
```

#### 163 邮箱
```yaml
MAIL_SERVER: smtp.163.com
MAIL_PORT: 465
MAIL_STARTTLS: false
MAIL_SSL_TLS: true
```

## 环境变量配置

在 `docker-compose.yml` 中添加邮件配置：

```yaml
backend:
  environment:
    # ... 其他配置
    MAIL_USERNAME: your-email@gmail.com
    MAIL_PASSWORD: your-app-password
    MAIL_FROM: your-email@gmail.com
    MAIL_FROM_NAME: Otaka 租车系统
    MAIL_PORT: 587
    MAIL_SERVER: smtp.gmail.com
    MAIL_STARTTLS: true
    MAIL_SSL_TLS: false
    MAIL_USE_CREDENTIALS: true
    MAIL_VALIDATE_CERTS: true
```

## 测试邮件功能

1. **启动服务**
   ```bash
   docker-compose up -d
   ```

2. **注册新用户**
   - 访问 http://localhost:3001
   - 注册一个新账户
   - 检查邮箱是否收到欢迎邮件

3. **上传驾照**
   - 登录用户账户
   - 上传驾照照片
   - 检查管理员邮箱是否收到通知

4. **审核驾照**
   - 登录管理后台
   - 审核驾照（通过/拒绝）
   - 检查用户邮箱是否收到结果邮件

## 邮件模板

系统使用 HTML 邮件模板，包含：
- 响应式设计
- 品牌色彩（绿色主题）
- 清晰的操作指引
- 专业的视觉设计

## 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查 SMTP 配置是否正确
   - 确认应用专用密码有效
   - 检查网络连接

2. **邮件被标记为垃圾邮件**
   - 配置 SPF 记录
   - 使用专业的邮件服务商
   - 避免使用敏感词汇

3. **Gmail 连接被拒绝**
   - 确保启用了两步验证
   - 使用应用专用密码而非账户密码
   - 检查 "允许不够安全的应用" 设置

### 调试模式

查看邮件发送日志：
```bash
docker-compose logs backend
```

## 安全建议

1. **使用环境变量**
   - 不要在代码中硬编码邮件密码
   - 使用 `.env` 文件或环境变量

2. **定期更新密码**
   - 定期更换应用专用密码
   - 监控邮件发送活动

3. **限制发送频率**
   - 避免发送过多邮件
   - 实现邮件发送限制

## 扩展功能

可以进一步扩展的邮件功能：
- 邮件模板自定义
- 多语言支持
- 邮件发送队列
- 邮件发送统计
- 邮件模板管理界面
