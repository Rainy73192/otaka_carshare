'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Upload, FileImage, CheckCircle, Clock, XCircle, LogOut, User, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CameraUpload } from '@/components/ui/CameraUpload'

interface DriverLicense {
  id: number
  file_name: string
  file_url: string
  file_size: number
  content_type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_notes?: string
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [license, setLicense] = useState<DriverLicense | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCameraUpload, setShowCameraUpload] = useState(false)

  useEffect(() => {
    if (user) {
      fetchLicense()
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const fetchLicense = async () => {
    try {
      const response = await axios.get('/api/v1/users/my-license')
      setLicense(response.data)
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('获取驾照信息失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post('/api/v1/auth/upload-license', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('驾照上传成功！')
      setSelectedFile(null)
      fetchLicense()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
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
              <User className="h-6 w-6 text-primary-500" />
              <h1 className="text-xl font-semibold text-gray-900">用户中心</h1>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>邮箱地址</Label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div>
                <Label>注册时间</Label>
                <p className="text-gray-900 font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
                </p>
              </div>
            </div>
          </Card>

          {/* License Upload */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">驾照上传</h2>
            
            {!license ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">请上传您的驾照照片</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button
                      onClick={() => setShowCameraUpload(true)}
                      className="flex flex-col items-center p-6 h-auto bg-green-500 hover:bg-green-600"
                    >
                      <Camera className="h-8 w-8 mb-2" />
                      <span>拍照上传</span>
                    </Button>
                    
                    <Button
                      onClick={() => setShowCameraUpload(true)}
                      className="flex flex-col items-center p-6 h-auto bg-blue-500 hover:bg-blue-600"
                    >
                      <FileImage className="h-8 w-8 mb-2" />
                      <span>相册选择</span>
                    </Button>
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-500">
                    支持 JPG、PNG 格式，文件大小不超过 5MB
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <FileImage className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? '上传中...' : '上传'}</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileImage className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{license.file_name}</p>
                      <p className="text-sm text-gray-500">
                        上传时间: {new Date(license.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(license.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                      {getStatusText(license.status)}
                    </span>
                  </div>
                </div>

                {license.admin_notes && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">管理员备注</h4>
                    <p className="text-sm text-yellow-700">{license.admin_notes}</p>
                  </div>
                )}

                {license.status === 'rejected' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      您的驾照申请被拒绝，请重新上传符合要求的驾照照片。
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setLicense(null)}
                    >
                      重新上传
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
      
      {/* Camera Upload Modal */}
      <CameraUpload
        isOpen={showCameraUpload}
        onFileSelect={handleFileSelect}
        onClose={() => setShowCameraUpload(false)}
      />
    </div>
  )
}
