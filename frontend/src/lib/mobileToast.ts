import toast from 'react-hot-toast'

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测是否为iOS设备
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 检测是否为Android设备
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

// 强制滚动到顶部并确保可见
export const forceScrollToTop = () => {
  try {
    // 立即滚动到顶部
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
      document.body.scrollLeft = 0
    }
    
    // 使用多种方法确保滚动
    if (window.scrollTo) {
      window.scrollTo(0, 0)
    }
    if (window.scroll) {
      window.scroll(0, 0)
    }
    
    // 移动端特殊处理
    if (isMobile()) {
      // 使用平滑滚动
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
      
      // 备用方案：强制滚动
      setTimeout(() => {
        if (document.documentElement) {
          document.documentElement.scrollTop = 0
        }
        if (document.body) {
          document.body.scrollTop = 0
        }
      }, 100)
    }
    
    console.log('Force scroll to top completed')
  } catch (error) {
    console.error('Force scroll to top error:', error)
  }
}

// 关闭虚拟键盘（如果存在）
export const dismissKeyboard = () => {
  try {
    // 移除焦点
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    
    // 对于移动端，尝试关闭虚拟键盘
    if (isMobile()) {
      // 创建一个隐藏的input来强制键盘关闭
      const hiddenInput = document.createElement('input')
      hiddenInput.style.position = 'absolute'
      hiddenInput.style.left = '-9999px'
      hiddenInput.style.top = '-9999px'
      hiddenInput.style.opacity = '0'
      hiddenInput.style.pointerEvents = 'none'
      document.body.appendChild(hiddenInput)
      
      // 聚焦然后立即失焦
      hiddenInput.focus()
      setTimeout(() => {
        hiddenInput.blur()
        document.body.removeChild(hiddenInput)
      }, 100)
    }
  } catch (error) {
    console.error('Dismiss keyboard error:', error)
  }
}

// 移动端优化的toast显示函数
export const mobileToast = {
  success: (message: string, options?: any) => {
    // 先滚动到顶部
    forceScrollToTop()
    
    // 关闭键盘
    dismissKeyboard()
    
    // 延迟显示toast，确保滚动完成
    setTimeout(() => {
      toast.success(message, {
        duration: 3000,
        ...options
      })
    }, 200)
  },
  
  error: (message: string, options?: any) => {
    // 先滚动到顶部
    forceScrollToTop()
    
    // 关闭键盘
    dismissKeyboard()
    
    // 延迟显示toast，确保滚动完成
    setTimeout(() => {
      toast.error(message, {
        duration: 5000,
        ...options
      })
    }, 200)
  },
  
  loading: (message: string, options?: any) => {
    // 先滚动到顶部
    forceScrollToTop()
    
    // 关闭键盘
    dismissKeyboard()
    
    // 延迟显示toast，确保滚动完成
    setTimeout(() => {
      toast.loading(message, {
        duration: Infinity,
        ...options
      })
    }, 200)
  }
}

// 页面刷新后显示toast的工具函数
export const showToastAfterRefresh = (message: string, type: 'success' | 'error' = 'success') => {
  // 将消息存储到sessionStorage
  sessionStorage.setItem('toastMessage', JSON.stringify({
    message,
    type,
    timestamp: Date.now()
  }))
  
  // 刷新页面
  window.location.reload()
}

// 检查并显示存储的toast消息
export const checkAndShowStoredToast = () => {
  try {
    const stored = sessionStorage.getItem('toastMessage')
    if (stored) {
      const { message, type, timestamp } = JSON.parse(stored)
      
      // 检查消息是否在5分钟内（避免过期消息）
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        // 清除存储的消息
        sessionStorage.removeItem('toastMessage')
        
        // 延迟显示toast，确保页面完全加载
        setTimeout(() => {
          if (type === 'success') {
            mobileToast.success(message)
          } else {
            mobileToast.error(message)
          }
        }, 1000)
      } else {
        // 清除过期消息
        sessionStorage.removeItem('toastMessage')
      }
    }
  } catch (error) {
    console.error('Check stored toast error:', error)
    sessionStorage.removeItem('toastMessage')
  }
}
