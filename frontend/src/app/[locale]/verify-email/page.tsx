'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations()
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
      setMessage(t('verification.checkEmail'))
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.post('/api/v1/auth/verify-email', {
        token: token
      })
      
      setStatus('success')
      setMessage(response.message)
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      console.error('验证错误:', error)
      setStatus('error')
      setMessage(error.message || '验证失败')
    }
  }

  const resendVerification = async () => {
    if (!email) {
      toast.error(t('verification.enterEmail'))
      return
    }

    setResending(true)
    try {
      await api.post('/api/v1/auth/resend-verification', {
        email: email
      })
      toast.success(t('verification.resendSuccess'))
    } catch (error: any) {
      console.error('重发邮件错误:', error)
      toast.error(error.message || t('verification.resendError'))
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
    <>
      {/* ngrok警告跳过脚本 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 跳过ngrok警告页面
            if (window.location.hostname.includes('ngrok')) {
              const warningBanner = document.querySelector('[data-testid="banner"]') || 
                                   document.querySelector('.banner') ||
                                   document.querySelector('[class*="warning"]') ||
                                   document.querySelector('[class*="banner"]');
              if (warningBanner) {
                warningBanner.style.display = 'none';
              }
              
              // 添加ngrok跳过头部
              if (typeof fetch !== 'undefined') {
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  if (args[1]) {
                    args[1].headers = {
                      ...args[1].headers,
                      'ngrok-skip-browser-warning': 'true'
                    };
                  } else {
                    args[1] = {
                      headers: {
                        'ngrok-skip-browser-warning': 'true'
                      }
                    };
                  }
                  return originalFetch.apply(this, args);
                };
              }
            }
          `,
        }}
      />
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ios-fix"
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
      <div 
        className="max-w-md w-full space-y-8"
        style={{ maxWidth: '448px', width: '100%' }}
      >
        <Card 
          className="p-8 ios-fix"
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            border: '1px solid #e5e7eb'
          }}
        >
          <div className="text-center">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            
            <h2 className={`mt-6 text-3xl font-bold ${getStatusColor()}`}>
              {status === 'success' && t('verification.verificationSuccess')}
              {status === 'error' && t('verification.verificationFailed')}
              {status === 'pending' && t('verification.waitingVerification')}
              {status === 'loading' && t('verification.verifying')}
            </h2>
            
            <p className="mt-4 text-gray-600">
              {message}
            </p>

            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  {t('verification.autoRedirect')}
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="mt-4"
                >
                  {t('verification.loginNow')}
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('verification.resendVerification')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('verification.enterEmail')}
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
                      {t('common.loading')}
                    </>
                  ) : (
                    t('verification.resendVerification')
                  )}
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  {t('verification.returnToLogin')}
                </Button>
              </div>
            )}

            {status === 'pending' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('verification.resendVerification')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('verification.enterEmail')}
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
                      {t('common.loading')}
                    </>
                  ) : (
                    t('verification.resendVerification')
                  )}
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  {t('verification.returnToLogin')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
    </>
  )
}
