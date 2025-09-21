'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Shield, Users, FileImage, CheckCircle, XCircle, Clock, LogOut, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
// 移除axios导入，改用fetch

interface User {
  id: number
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface DriverLicense {
  id: number
  user_id: number
  file_name: string
  file_url: string
  file_size: number
  content_type: string
  license_type: 'front' | 'back'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_notes?: string
}

interface CombinedLicense {
  user_id: number
  user: User
  licenses: {
    front?: DriverLicense
    back?: DriverLicense
  }
  status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminPage() {
  const { user, adminLogin, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [licenses, setLicenses] = useState<CombinedLicense[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLicense, setSelectedLicense] = useState<CombinedLicense | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user && user.is_admin) {
      fetchLicenses()
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user && !user.is_admin) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adminLogin(email, password)
      toast.success(t('toast.adminLoginSuccess'))
    } catch (error: any) {
      let errorMessage = t('toast.loginFailed')
      if (error.message) {
        if (error.message.includes('Incorrect email or password')) {
          errorMessage = t('toast.invalidCredentials')
        } else if (error.message.includes('not an admin')) {
          errorMessage = t('toast.noAdminPermission')
        } else {
          errorMessage = error.message
        }
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''
      
      const response = await fetch('/api/v1/admin/driver-licenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLicenses(data)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('获取驾照列表错误:', error)
      toast.error(t('toast.licenseListError'))
    }
  }

  const updateLicenseStatus = async (userId: number, status: 'approved' | 'rejected') => {
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''
      
      const response = await fetch(`/api/v1/admin/driver-licenses/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes
        })
      })
      
      if (response.ok) {
        toast.success(t('toast.statusUpdateSuccess'))
        setSelectedLicense(null)
        setAdminNotes('')
        await fetchLicenses()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('更新状态错误:', error)
      toast.error(t('toast.updateFailed'))
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '审核中'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">管理员登录</h2>
              <p className="text-gray-600">请输入管理员账户信息</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入管理员邮箱"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                返回用户端
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">管理后台</h1>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{licenses.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待审核</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {licenses.filter(l => l.status === 'pending').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已通过</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {licenses.filter(l => l.status === 'approved').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已拒绝</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {licenses.filter(l => l.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">搜索</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="搜索用户邮箱或文件名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <Label htmlFor="status">状态筛选</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">全部</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            </div>
          </Card>

          {/* License List */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">驾照审核列表</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上传时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLicenses.map((license) => (
                    <tr key={license.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{license.user?.email || '未知邮箱'}</div>
                          <div className="text-sm text-gray-500">ID: {license.user?.id || '未知ID'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {license.licenses.front && (
                            <div className="flex items-center">
                              <FileImage className="h-6 w-6 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">驾照正面</div>
                                <div className="text-xs text-gray-500">{license.licenses.front.file_name}</div>
                              </div>
                            </div>
                          )}
                          {license.licenses.back && (
                            <div className="flex items-center">
                              <FileImage className="h-6 w-6 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">驾照反面</div>
                                <div className="text-xs text-gray-500">{license.licenses.back.file_name}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(license.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                            {getStatusText(license.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(license.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLicense(license)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* License Detail Modal */}
      {selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Loading Overlay */}
            {isUpdating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="text-sm text-gray-600">正在处理中...</p>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">驾照详情</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLicense(null)}
                  disabled={isUpdating}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>用户邮箱</Label>
                  <p className="text-gray-900">{selectedLicense.user?.email || '未知邮箱'}</p>
                </div>
                
                <div>
                  <Label>当前状态</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedLicense.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLicense.status)}`}>
                      {getStatusText(selectedLicense.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label>驾照图片</Label>
                  <div className="mt-2 space-y-4">
                    {selectedLicense.licenses.front && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">驾照正面</h4>
                        <img
                          src={selectedLicense.licenses.front.file_url}
                          alt="Driver License Front"
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.error('图片加载失败:', selectedLicense.licenses.front?.file_url)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedLicense.licenses.front.file_name} ({(selectedLicense.licenses.front.file_size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                    
                    {selectedLicense.licenses.back && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">驾照反面</h4>
                        <img
                          src={selectedLicense.licenses.back.file_url}
                          alt="Driver License Back"
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.error('图片加载失败:', selectedLicense.licenses.back?.file_url)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedLicense.licenses.back.file_name} ({(selectedLicense.licenses.back.file_size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedLicense.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-notes">管理员备注</Label>
                      <textarea
                        id="admin-notes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="请输入审核备注..."
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        rows={3}
                        disabled={isUpdating}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => updateLicenseStatus(selectedLicense.user_id, 'approved')}
                        className="flex-1"
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        通过
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => updateLicenseStatus(selectedLicense.user_id, 'rejected')}
                        className="flex-1"
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        拒绝
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
