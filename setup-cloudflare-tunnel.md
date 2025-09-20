# Cloudflare Tunnel 配置指南

## 1. 安装 Cloudflare Tunnel

### Windows
```bash
# 下载 cloudflared
# 访问: https://github.com/cloudflare/cloudflared/releases
# 下载 cloudflared-windows-amd64.exe
# 重命名为 cloudflared.exe 并放到 PATH 目录
```

### Linux/Mac
```bash
# 使用包管理器安装
# Ubuntu/Debian
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS
brew install cloudflared
```

## 2. 登录 Cloudflare

```bash
cloudflared tunnel login
```

## 3. 创建隧道

```bash
# 创建隧道
cloudflared tunnel create otaka-demo

# 记录返回的隧道ID
```

## 4. 配置隧道

创建配置文件 `~/.cloudflared/config.yml`:

```yaml
tunnel: <你的隧道ID>
credentials-file: /home/user/.cloudflared/<隧道ID>.json

ingress:
  - hostname: otaka-demo.yourdomain.com
    service: http://localhost:3001
  - hostname: otaka-api.yourdomain.com
    service: http://localhost:8001
  - service: http_status:404
```

## 5. 配置 DNS

在 Cloudflare 控制台添加 CNAME 记录：
- `otaka-demo` -> `<隧道ID>.cfargotunnel.com`
- `otaka-api` -> `<隧道ID>.cfargotunnel.com`

## 6. 启动隧道

```bash
# 启动隧道
cloudflared tunnel run otaka-demo
```

## 7. 访问地址

- 前端: https://otaka-demo.yourdomain.com
- 后端API: https://otaka-api.yourdomain.com
