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
// 移除axios导入，改用fetch
import { CameraUpload } from '@/components/ui/CameraUpload'
import { mobileScrollToTop } from '@/lib/scrollUtils'

interface DriverLicense {
  id: number
  file_name: string
  file_url: string
  file_size: number
  content_type: string
  license_type: 'front' | 'back'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_notes?: string
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const { locale } = params
  const [licenses, setLicenses] = useState<DriverLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{front: File | null, back: File | null}>({front: null, back: null})
  const [showCameraUpload, setShowCameraUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState<'front' | 'back' | undefined>(undefined)

  useEffect(() => {
    if (user) {
      fetchLicense()
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}`)
    }
  }, [authLoading, user, router])

  const fetchLicense = async () => {
    try {
      // 添加时间戳参数防止缓存
      const timestamp = new Date().getTime()
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''
      
      const response = await fetch(`/api/v1/users/my-license?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLicenses(data)
      } else if (response.status !== 404) {
        toast.error('获取驾照信息失败')
      }
    } catch (error: any) {
      console.error('获取驾照信息错误:', error)
      toast.error('获取驾照信息失败')
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async (mode: 'front' | 'back') => {
    try {
      console.log(`Starting camera for ${mode}`)
      
      // 点击拍照按钮时立即滚动到顶部
      mobileScrollToTop(100)
      
      // 设置上传模式
      setUploadMode(mode)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // 使用后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      // 创建视频元素
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.playsInline = true
      video.style.width = '100%'
      video.style.height = '300px'
      video.style.objectFit = 'cover'
      
      // 创建画布
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      // 创建弹窗
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `
      
      const container = document.createElement('div')
      container.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 400px;
        width: 90%;
        text-align: center;
      `
      
      const title = document.createElement('h3')
      title.textContent = `拍摄驾照${mode === 'front' ? '正面' : '反面'}照片`
      title.style.cssText = 'margin-bottom: 20px; font-size: 18px; font-weight: 600;'
      
      const videoContainer = document.createElement('div')
      videoContainer.style.cssText = `
        position: relative;
        background: black;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 20px;
      `
      
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      `
      
      const frame = document.createElement('div')
      frame.style.cssText = `
        border: 2px dashed white;
        border-radius: 8px;
        width: 200px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      frame.innerHTML = '<span style="color: white; font-size: 14px;">将驾照放在框内</span>'
      
      overlay.appendChild(frame)
      videoContainer.appendChild(video)
      videoContainer.appendChild(overlay)
      
      const buttonContainer = document.createElement('div')
      buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;'
      
      const cancelBtn = document.createElement('button')
      cancelBtn.textContent = '取消'
      cancelBtn.style.cssText = `
        padding: 10px 20px;
        border: 1px solid #ccc;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        min-height: 44px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      `
      
      const captureBtn = document.createElement('button')
      captureBtn.textContent = '拍照'
      captureBtn.style.cssText = `
        padding: 10px 20px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        min-height: 44px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      `
      
      buttonContainer.appendChild(cancelBtn)
      buttonContainer.appendChild(captureBtn)
      
      container.appendChild(title)
      container.appendChild(videoContainer)
      container.appendChild(buttonContainer)
      modal.appendChild(container)
      document.body.appendChild(modal)
      
      // 事件处理
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop())
        if (document.body.contains(modal)) {
          document.body.removeChild(modal)
        }
        setUploadMode(undefined)
      }
      
      cancelBtn.onclick = cleanup
      
      captureBtn.onclick = () => {
        console.log(`Capturing photo for ${mode}`)
        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `license-${mode}-${Date.now()}.jpg`, { type: 'image/jpeg' })
              console.log(`File created for ${mode}:`, file.name)
              console.log(`Current uploadMode before handleFileSelect:`, uploadMode)
              
              // 确保uploadMode在调用handleFileSelect时仍然有效
              if (uploadMode === mode) {
                handleFileSelect(file)
              } else {
                console.error(`UploadMode mismatch: expected ${mode}, got ${uploadMode}`)
                // 直接设置文件，不依赖uploadMode状态
                setSelectedFiles(prev => {
                  const newFiles = {
                    ...prev,
                    [mode]: file
                  }
                  console.log('Direct file setting:', newFiles)
                  return newFiles
                })
                toast.success(`已添加${mode === 'front' ? '正面' : '反面'}照片`)
              }
              cleanup()
              
              // 拍照完成后自动滚动到页面顶部 - 移动端优化
              mobileScrollToTop(300)
            }
          }, 'image/jpeg', 0.8)
        }
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('无法访问摄像头，请检查权限设置')
      setUploadMode(undefined)
    }
  }

  const handleFileSelect = (file: File) => {
    console.log('handleFileSelect called with file:', file.name)
    console.log('Current uploadMode:', uploadMode)
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过 5MB')
        return
      }
      if (uploadMode) {
        console.log(`Setting file for ${uploadMode}:`, file.name)
        setSelectedFiles(prev => {
          const newFiles = {
            ...prev,
            [uploadMode]: file
          }
          console.log('New selectedFiles:', newFiles)
          return newFiles
        })
        setUploadMode(undefined)
        setShowCameraUpload(false)
        toast.success(`已添加${uploadMode === 'front' ? '正面' : '反面'}照片`)
        
        // 文件选择完成后自动滚动到页面顶部 - 移动端优化
        mobileScrollToTop(200)
      } else {
        console.error('No uploadMode set, cannot assign file')
        toast.error('无法确定照片类型，请重试')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles.front || !selectedFiles.back) {
      toast.error('请上传驾照正反面照片')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('front_image', selectedFiles.front)
      formData.append('back_image', selectedFiles.back)

      console.log('开始上传文件...')
      console.log('Front file:', selectedFiles.front.name, selectedFiles.front.size)
      console.log('Back file:', selectedFiles.back.name, selectedFiles.back.size)
      
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''
      console.log('Token available:', !!token)

      // 使用fetch进行文件上传，确保在ngrok环境下正常工作
      const response = await fetch('/api/v1/auth/upload-license', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
          // 注意：不设置Content-Type，让浏览器自动设置multipart/form-data边界
        }
      })

      console.log('上传响应:', response.status)

      // fetch响应处理
      if (response.ok) {
        const data = await response.json()
        console.log('上传成功:', data)
        toast.success('驾照上传成功！')
        setSelectedFiles({front: null, back: null})
        fetchLicense()
        // 上传成功后滚动到顶部
        mobileScrollToTop(200)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error('上传错误:', error)
      console.error('错误消息:', error.message)
      
      const errorMessage = error.message || '上传失败'
      toast.error(errorMessage)
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
            
            {licenses.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">请上传您的驾照正反面照片</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* 正面照片 */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 text-center">驾照正面</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {selectedFiles.front ? (
                          <div className="space-y-2">
                            <FileImage className="h-12 w-12 text-green-500 mx-auto" />
                            <p className="text-sm font-medium text-gray-900">{selectedFiles.front.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFiles.front.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // 点击重新拍照按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('front')
                                  startCamera('front')
                                }}
                              >
                                重新拍照
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // 点击重新选择按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('front')
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) handleFileSelect(file)
                                  }
                                  input.click()
                                }}
                              >
                                重新选择
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => {
                                  setUploadMode('front')
                                  startCamera('front')
                                }}
                                className="flex flex-col items-center p-3 h-auto bg-green-500 hover:bg-green-600"
                                size="sm"
                              >
                                <Camera className="h-5 w-5 mb-1" />
                                <span className="text-xs">拍照</span>
                              </Button>
                              
                              <Button
                                onClick={() => {
                                  // 点击相册按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('front')
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) handleFileSelect(file)
                                  }
                                  input.click()
                                }}
                                className="flex flex-col items-center p-3 h-auto bg-blue-500 hover:bg-blue-600"
                                size="sm"
                              >
                                <FileImage className="h-5 w-5 mb-1" />
                                <span className="text-xs">相册</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 反面照片 */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 text-center">驾照反面</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {selectedFiles.back ? (
                          <div className="space-y-2">
                            <FileImage className="h-12 w-12 text-green-500 mx-auto" />
                            <p className="text-sm font-medium text-gray-900">{selectedFiles.back.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFiles.back.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // 点击重新拍照按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('back')
                                  startCamera('back')
                                }}
                              >
                                重新拍照
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // 点击重新选择按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('back')
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) handleFileSelect(file)
                                  }
                                  input.click()
                                }}
                              >
                                重新选择
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => {
                                  // 点击拍照按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('back')
                                  startCamera('back')
                                }}
                                className="flex flex-col items-center p-3 h-auto bg-green-500 hover:bg-green-600"
                                size="sm"
                              >
                                <Camera className="h-5 w-5 mb-1" />
                                <span className="text-xs">拍照</span>
                              </Button>
                              
                              <Button
                                onClick={() => {
                                  // 点击相册按钮时立即滚动到顶部
                                  mobileScrollToTop(100)
                                  
                                  setUploadMode('back')
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*'
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) handleFileSelect(file)
                                  }
                                  input.click()
                                }}
                                className="flex flex-col items-center p-3 h-auto bg-blue-500 hover:bg-blue-600"
                                size="sm"
                              >
                                <FileImage className="h-5 w-5 mb-1" />
                                <span className="text-xs">相册</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-500">
                    支持 JPG、PNG 格式，文件大小不超过 5MB
                  </p>
                </div>
                
                {selectedFiles.front && selectedFiles.back && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? '上传中...' : '上传驾照'}</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {licenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileImage className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {license.license_type === 'front' ? '驾照正面' : '驾照反面'} - {license.file_name}
                        </p>
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
                ))}

                {licenses.some(license => license.admin_notes) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">管理员备注</h4>
                    {licenses.filter(license => license.admin_notes).map((license) => (
                      <div key={license.id} className="mb-2">
                        <p className="text-xs text-yellow-600 font-medium">
                          {license.license_type === 'front' ? '正面' : '反面'}:
                        </p>
                        <p className="text-sm text-yellow-700">{license.admin_notes}</p>
                      </div>
                    ))}
                  </div>
                )}

                {licenses.some(license => license.status === 'rejected') && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      您的驾照申请被拒绝，请重新上传符合要求的驾照照片。
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setLicenses([])
                        setSelectedFiles({front: null, back: null})
                      }}
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
        onClose={() => {
          setShowCameraUpload(false)
          setUploadMode(undefined)
        }}
        uploadMode={uploadMode}
      />
    </div>
  )
}
