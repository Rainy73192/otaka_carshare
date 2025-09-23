// 动态获取API URL
const getApiUrl = () => {
  // 优先检查环境变量（包括空字符串）
  if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  if (typeof window !== 'undefined') {
    // 在浏览器环境中
    const hostname = window.location.hostname
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free')) {
      // 如果是ngrok域名，使用相对路径（通过Next.js代理）
      return ''
    }
  }
  return 'http://localhost:8001'
}

const API_URL = getApiUrl()
console.log('API_URL:', API_URL)
console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side')
console.log('Current location:', typeof window !== 'undefined' ? window.location.href : 'server-side')

// 获取认证token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || null
  }
  return null
}

// 创建fetch请求的通用函数
const createRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const fullUrl = API_URL ? `${API_URL}${url}` : url
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    }
  }
  
  try {
    const response = await fetch(fullUrl, config)
    
    // 处理401未授权错误
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.href = '/'
      }
      throw new Error('Unauthorized')
    }
    
    return response
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// API方法
export const api = {
  get: async (url: string, options: RequestInit = {}) => {
    const response = await createRequest(url, { ...options, method: 'GET' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },
  
  post: async (url: string, data?: any, options: RequestInit = {}) => {
    const response = await createRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }
    return response.json()
  },
  
  put: async (url: string, data?: any, options: RequestInit = {}) => {
    const response = await createRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }
    return response.json()
  },
  
  delete: async (url: string, options: RequestInit = {}) => {
    const response = await createRequest(url, { ...options, method: 'DELETE' })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }
    return response.json()
  }
}

export default api
