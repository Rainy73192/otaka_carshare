import axios from 'axios'

// 动态获取API URL
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // 在浏览器环境中
    const hostname = window.location.hostname
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free')) {
      // 如果是ngrok域名，使用相对路径（通过Next.js代理）
      return ''
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
}

const API_URL = getApiUrl()
console.log('API_URL:', API_URL)
console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
