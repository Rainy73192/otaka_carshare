# 本地网络部署指南

## 1. 路由器配置

### 端口转发设置
在路由器管理界面添加以下端口转发规则：

| 内部端口 | 外部端口 | 协议 | 内部IP | 说明 |
|----------|----------|------|--------|------|
| 3001 | 3001 | TCP | 你的电脑IP | 前端服务 |
| 8001 | 8001 | TCP | 你的电脑IP | 后端API |
| 5433 | 5433 | TCP | 你的电脑IP | 数据库（可选） |
| 9001 | 9001 | TCP | 你的电脑IP | MinIO控制台（可选） |

## 2. 获取公网IP

```bash
# 查看公网IP
curl ifconfig.me
# 或访问: https://whatismyipaddress.com
```

## 3. 防火墙配置

### Windows
```cmd
# 允许端口通过防火墙
netsh advfirewall firewall add rule name="Otaka Frontend" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Otaka Backend" dir=in action=allow protocol=TCP localport=8001
```

### Linux
```bash
# Ubuntu/Debian
sudo ufw allow 3001
sudo ufw allow 8001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --reload
```

## 4. 修改配置

更新 `docker-compose.yml` 中的前端配置：

```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: http://你的公网IP:8001
```

## 5. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

## 6. 访问地址

- 前端: http://你的公网IP:3001
- 后端API: http://你的公网IP:8001
- 数据库: 你的公网IP:5433
- MinIO控制台: http://你的公网IP:9001

## 7. 注意事项

1. **安全性**: 生产环境建议使用HTTPS
2. **稳定性**: 公网IP可能变化，建议使用动态DNS
3. **性能**: 本地网络可能较慢，建议优化配置
