#!/usr/bin/env python3
"""
Test script to verify the system is working correctly
"""
import requests
import time
import json

def test_system():
    """Test the system endpoints"""
    base_url = "http://localhost:8001"
    
    print("🧪 开始测试系统...")
    
    # Test 1: Health check
    print("\n1. 测试健康检查...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 健康检查通过")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False
    
    # Test 2: API documentation
    print("\n2. 测试 API 文档...")
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API 文档可访问")
        else:
            print(f"❌ API 文档不可访问: {response.status_code}")
    except Exception as e:
        print(f"❌ API 文档测试失败: {e}")
    
    # Test 3: User registration
    print("\n3. 测试用户注册...")
    try:
        test_user = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{base_url}/api/v1/auth/register", json=test_user, timeout=5)
        if response.status_code == 200:
            print("✅ 用户注册成功")
        else:
            print(f"❌ 用户注册失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ 用户注册测试失败: {e}")
    
    # Test 4: User login
    print("\n4. 测试用户登录...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data, timeout=5)
        if response.status_code == 200:
            token_data = response.json()
            print("✅ 用户登录成功")
            
            # Test 5: Get user info
            print("\n5. 测试获取用户信息...")
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers, timeout=5)
            if response.status_code == 200:
                print("✅ 获取用户信息成功")
            else:
                print(f"❌ 获取用户信息失败: {response.status_code}")
        else:
            print(f"❌ 用户登录失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ 用户登录测试失败: {e}")
    
    # Test 6: Admin login
    print("\n6. 测试管理员登录...")
    try:
        admin_data = {
            "email": "admin@otaka.com",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/api/v1/auth/admin/login", json=admin_data, timeout=5)
        if response.status_code == 200:
            print("✅ 管理员登录成功")
        else:
            print(f"❌ 管理员登录失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ 管理员登录测试失败: {e}")
    
    print("\n🎉 系统测试完成！")
    print("\n📝 测试结果总结：")
    print("   - 如果所有测试都显示 ✅，说明系统运行正常")
    print("   - 如果有 ❌ 错误，请检查 Docker 容器是否正常运行")
    print("   - 可以访问 http://localhost:3001 查看前端界面")
    print("   - 可以访问 http://localhost:8001/docs 查看 API 文档")

if __name__ == "__main__":
    print("等待系统启动...")
    time.sleep(5)  # Wait for services to start
    test_system()
