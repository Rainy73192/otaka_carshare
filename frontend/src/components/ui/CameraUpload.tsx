'use client'

import { useState, useRef } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { Camera, Image, X, RotateCcw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CameraUploadProps {
  onFileSelect: (file: File) => void
  onClose: () => void
  isOpen: boolean
  uploadMode?: 'front' | 'back'
}

export function CameraUpload({ onFileSelect, onClose, isOpen, uploadMode }: CameraUploadProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'preview'>('select')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // 使用后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setMode('camera')
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('无法访问摄像头，请检查权限设置')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setMode('select')
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        // 设置画布尺寸
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // 绘制视频帧到画布
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 转换为 Blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            setSelectedFile(file)
            setCapturedImage(canvas.toDataURL('image/jpeg'))
            setMode('preview')
            stopCamera()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        setMode('preview')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
      onClose()
    }
  }

  const handleRetake = () => {
    setSelectedFile(null)
    setCapturedImage(null)
    setMode('select')
  }

  const handleClose = () => {
    stopCamera()
    setSelectedFile(null)
    setCapturedImage(null)
    setMode('select')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              上传驾照{uploadMode === 'front' ? '正面' : uploadMode === 'back' ? '反面' : ''}照片
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="text-center text-gray-600 mb-6">
                请选择上传方式
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={startCamera}
                  className="flex flex-col items-center p-6 h-auto"
                  variant="outline"
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span>拍照</span>
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center p-6 h-auto"
                  variant="outline"
                >
                  <Image className="h-8 w-8 mb-2" />
                  <span>相册</span>
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed rounded-lg w-48 h-32 flex items-center justify-center">
                    <span className="text-white text-sm">将驾照放在框内</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex items-center bg-green-500 hover:bg-green-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  拍照
                </Button>
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedImage || ''}
                  alt="Preview"
                  className="w-full h-64 object-contain"
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                请确认照片清晰，信息完整
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重拍
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex items-center bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  确认上传
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
