'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function RegisterSuccessPage() {
  const router = useRouter()
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  const resendVerification = async () => {
    if (!email) {
      toast.error(t('verification.enterEmail'))
      return
    }

    setResending(true)
    try {
      await axios.post('/api/v1/auth/resend-verification', {
        email: email
      })
      toast.success(t('verification.resendSuccess'))
    } catch (error: any) {
      console.error('重发邮件错误:', error)
      toast.error(error.response?.data?.detail || t('verification.resendError'))
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
              {t('registerSuccess.title')}
            </h2>
            
            <p className="mt-4 text-gray-600">
              {t('registerSuccess.message')}
            </p>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {t('registerSuccess.nextSteps')}：
              </h3>
              <ol className="text-sm text-blue-700 space-y-1 text-left">
                <li>1. {t('registerSuccess.step1')}</li>
                <li>2. {t('registerSuccess.step2')}</li>
                <li>3. {t('registerSuccess.step3')}</li>
              </ol>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registerSuccess.noEmailReceived')}
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
                    {t('registerSuccess.sending')}
                  </>
                ) : (
                  t('registerSuccess.resendEmail')
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('registerSuccess.returnToLogin')}
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>{t('registerSuccess.tokenExpires')}</p>
              <p>{t('registerSuccess.contactSupport')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
