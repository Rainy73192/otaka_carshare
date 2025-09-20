// 移动端滚动工具函数
export const scrollToTop = (delay: number = 100) => {
  setTimeout(() => {
    try {
      // 方法1: 使用 window.scrollTo (现代浏览器)
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
      
      // 方法2: 直接设置 scrollTop (兼容性更好)
      if (document.documentElement) {
        document.documentElement.scrollTop = 0
      }
      if (document.body) {
        document.body.scrollTop = 0
      }
      
      // 方法3: 使用 window.scroll (移动端Safari)
      if (window.scroll) {
        window.scroll(0, 0)
      }
      
      // 方法4: 使用 pageYOffset (老版本浏览器)
      if (window.pageYOffset !== undefined) {
        window.scroll(0, 0)
      }
      
      // 方法5: 强制滚动到顶部 (最后的备用方案)
      const scrollContainer = document.querySelector('html') || document.querySelector('body')
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
      
      console.log('Scroll to top executed')
    } catch (error) {
      console.error('Scroll to top failed:', error)
    }
  }, delay)
}

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 移动端专用的滚动函数
export const mobileScrollToTop = (delay: number = 200) => {
  console.log('mobileScrollToTop called, isMobile:', isMobile())
  
  setTimeout(() => {
    try {
      // 强制立即滚动到顶部
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
      
      console.log('Scroll to top completed')
    } catch (error) {
      console.error('Scroll to top error:', error)
    }
  }, delay)
}
