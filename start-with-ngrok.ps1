# 启动 ngrok 并更新配置的 PowerShell 脚本

Write-Host "========================================" -ForegroundColor Green
Write-Host "启动 ngrok 并更新配置" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 检查 ngrok 是否已安装
try {
    $ngrokPath = Get-Command ngrok -ErrorAction Stop
    Write-Host "找到 ngrok: $($ngrokPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 ngrok，请先安装 ngrok" -ForegroundColor Red
    Write-Host "下载地址: https://ngrok.com/download" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 停止现有的 Docker 服务
Write-Host "停止现有的 Docker 服务..." -ForegroundColor Yellow
docker-compose down

# 启动 ngrok (在后台)
Write-Host "启动 ngrok..." -ForegroundColor Yellow
Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -WindowStyle Hidden

# 等待 ngrok 启动
Write-Host "等待 ngrok 启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 获取 ngrok URL
Write-Host "获取 ngrok URL..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $ngrokUrl = $response.tunnels[0].public_url
    
    if (-not $ngrokUrl) {
        throw "无法获取 ngrok URL"
    }
    
    Write-Host "获取到 ngrok URL: $ngrokUrl" -ForegroundColor Green
} catch {
    Write-Host "错误: 无法获取 ngrok URL" -ForegroundColor Red
    Write-Host "请确保 ngrok 正在运行并且可以访问 http://localhost:4040" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 更新 docker-compose.yml 中的 BASE_URL
Write-Host "更新 docker-compose.yml..." -ForegroundColor Yellow
$content = Get-Content 'docker-compose.yml' -Raw
$content = $content -replace 'BASE_URL: https://[^/\s]+', "BASE_URL: $ngrokUrl"
Set-Content 'docker-compose.yml' -Value $content

# 启动 Docker 服务
Write-Host "启动 Docker 服务..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "========================================" -ForegroundColor Green
Write-Host "启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "ngrok URL: $ngrokUrl" -ForegroundColor Cyan
Write-Host "前端地址: $ngrokUrl" -ForegroundColor Cyan
Write-Host "后端地址: $($ngrokUrl):8001" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Read-Host "按回车键退出"
