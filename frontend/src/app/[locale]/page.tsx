'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Car, User, Shield, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { mobileScrollToTop } from '@/lib/scrollUtils'
import { mobileToast, checkAndShowStoredToast, showToastAfterRefresh } from '@/lib/mobileToast'

export default function HomePage({ params }: { params: { locale: string } }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()
  const t = useTranslations()
  const { locale } = params

  // 检查并显示存储的toast消息
  useEffect(() => {
    checkAndShowStoredToast()
  }, [])

  // 检测是否为移动设备
  const isMobileDevice = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        mobileToast.success(t('auth.loginSuccess'))
        // 登录成功后滚动到顶部，然后跳转
        mobileScrollToTop(100)
        setTimeout(() => {
          router.push(`/${locale}/dashboard`)
        }, 500)
      } else {
        await register(email, password, locale)
        // 注册成功后跳转到验证页面
        mobileToast.success(t('auth.registerSuccess'))
        // 注册成功后滚动到顶部，然后跳转
        mobileScrollToTop(100)
        setTimeout(() => {
          router.push(`/${locale}/register-success`)
        }, 500)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      let errorMessage = t('common.error')
      
      // 根据错误类型显示不同的提示
      if (error.message) {
        if (error.message.includes('Incorrect email or password')) {
          errorMessage = t('auth.invalidCredentials')
        } else if (error.message.includes('User not found')) {
          errorMessage = t('auth.userNotFound')
        } else if (error.message.includes('Invalid credentials')) {
          errorMessage = t('auth.invalidCredentials')
        } else if (error.message.includes('Email already registered and verified')) {
          errorMessage = t('auth.emailAlreadyRegistered')
        } else if (error.message.includes('Email already exists')) {
          errorMessage = t('auth.emailAlreadyExists')
        } else if (error.message.includes('Account not verified')) {
          errorMessage = t('auth.accountNotVerified')
        } else {
          errorMessage = error.message
        }
      }
      
      mobileToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Car className="h-8 w-8 sm:h-10 sm:w-10 text-primary-500" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Otaka 租车</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              <LanguageSwitcher />
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/admin`)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('navigation.admin')}</span>
                <span className="sm:hidden">管理</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8" style={{ zIndex: 1 }}>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
              </h2>
              <p className="text-gray-600">
                {isLogin ? t('auth.loginYourAccount') : t('auth.createAccount')}
              </p>
            </div>

            <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                  className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
                >
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  onClick={() => setIsLogin(false)}
                  className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
                >
                  {t('auth.register')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={isLogin ? 'login' : 'register'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                    }}
                    placeholder={t('auth.email')}
                    required
                    className="mt-1"
                    autoComplete="email"
                    inputMode="email"
                  />
                  </div>

                  <div>
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                      }}
                      placeholder={t('auth.password')}
                      required
                      className="mt-1"
                      autoComplete="current-password"
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={loading}
                    onClick={(e) => {
                      // 移除 preventDefault() 以避免被动事件监听器错误
                      // 直接调用handleSubmit，不依赖表单提交
                      handleSubmit(e as any)
                    }}
                  >
                    {loading ? t('common.loading') : (isLogin ? t('auth.login') : t('auth.register'))}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Upload className="h-4 w-4" />
                <span>{t('features.uploadLicense')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>{t('features.secureAuth')}</span>
              </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
