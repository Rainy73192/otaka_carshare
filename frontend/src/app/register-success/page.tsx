'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function RegisterSuccessPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  const resendVerification = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    setResending(true)
    try {
      await axios.post('http://localhost:8001/api/v1/auth/resend-verification', {
        email: email
      })
      toast.success('验证邮件已重新发送')
    } catch (error: any) {
      console.error('重发邮件错误:', error)
      toast.error(error.response?.data?.detail || '发送失败')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              注册成功！
            </h2>
            
            <p className="mt-4 text-gray-600">
              我们已经向您的邮箱发送了验证邮件，请点击邮件中的链接完成注册。
            </p>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                下一步操作：
              </h3>
              <ol className="text-sm text-blue-700 space-y-1 text-left">
                <li>1. 检查您的邮箱（包括垃圾邮件文件夹）</li>
                <li>2. 点击邮件中的验证链接</li>
                <li>3. 验证成功后即可登录使用</li>
              </ol>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  没有收到邮件？重新发送验证邮件
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Button
                onClick={resendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '重新发送验证邮件'
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回登录页面
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>验证链接将在24小时后过期</p>
              <p>如果遇到问题，请联系客服</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
