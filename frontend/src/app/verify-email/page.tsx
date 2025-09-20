'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('pending')
      setMessage('请检查您的邮箱中的验证链接')
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.post('http://localhost:8001/api/v1/auth/verify-email', {
        token: token
      })
      
      setStatus('success')
      setMessage(response.data.message)
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      console.error('验证错误:', error)
      setStatus('error')
      setMessage(error.response?.data?.detail || '验证失败')
    }
  }

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

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'pending':
        return <Mail className="h-16 w-16 text-blue-500" />
      default:
        return <RefreshCw className="h-16 w-16 text-gray-500 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'pending':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            
            <h2 className={`mt-6 text-3xl font-bold ${getStatusColor()}`}>
              {status === 'success' && '验证成功！'}
              {status === 'error' && '验证失败'}
              {status === 'pending' && '等待验证'}
              {status === 'loading' && '正在验证...'}
            </h2>
            
            <p className="mt-4 text-gray-600">
              {message}
            </p>

            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  3秒后自动跳转到登录页面...
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="mt-4"
                >
                  立即登录
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    重新发送验证邮件
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
                  返回登录
                </Button>
              </div>
            )}

            {status === 'pending' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    重新发送验证邮件
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
                  返回登录
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
