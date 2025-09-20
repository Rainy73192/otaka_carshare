'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('token')
      if (savedToken) {
        setToken(savedToken)
        
        try {
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            throw new Error('Token validation failed')
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          // Token is invalid, clear it
          Cookies.remove('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt with fetch:', { email, passwordLength: password.length })
      
      // 使用fetch替代axios
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Login response:', data)
      const { access_token } = data
      setToken(access_token)
      Cookies.set('token', access_token, { expires: 7 })
      
      // Get user info using fetch
      const userResponse = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user info')
      }
      
      const userData = await userResponse.json()
      setUser(userData)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || '登录失败')
    }
  }

  const register = async (email: string, password: string): Promise<any> => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // 注册成功，返回响应数据
        return data
      } else {
        throw new Error(data.detail || '注册失败')
      }
    } catch (error: any) {
      throw new Error(error.message || '注册失败')
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      const { access_token } = data
      setToken(access_token)
      Cookies.set('token', access_token, { expires: 7 })
      
      // Get user info
      const userResponse = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user info')
      }
      
      const userData = await userResponse.json()
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.message || '管理员登录失败')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    Cookies.remove('token')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      adminLogin,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
