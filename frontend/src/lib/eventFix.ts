// 修复被动事件监听器问题的工具函数

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 修复被动事件监听器问题
export const fixPassiveEventListeners = () => {
  if (!isBrowser) return

  // 保存原始的addEventListener方法
  const originalAddEventListener = EventTarget.prototype.addEventListener

  // 重写addEventListener方法
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    // 如果是触摸、滚动或滚轮事件，确保不是被动模式
    if (type === 'touchstart' || type === 'touchmove' || type === 'touchend' || 
        type === 'wheel' || type === 'scroll') {
      
      // 如果options是对象，确保passive为false
      if (typeof options === 'object' && options !== null) {
        options = { ...options, passive: false }
      } else if (options === undefined) {
        options = { passive: false }
      }
    }

    // 调用原始方法
    return originalAddEventListener.call(this, type, listener, options)
  }
}

// 修复React合成事件的问题
export const fixReactSyntheticEvents = () => {
  if (!isBrowser) return

  // 监听所有触摸事件，确保可以调用preventDefault
  const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel']
  
  touchEvents.forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      // 确保事件不是被动的
      if (e.cancelable) {
        // 这里不做任何操作，只是确保事件不是被动的
      }
    }, { passive: false, capture: true })
  })
}

// 修复React内部事件处理
export const fixReactInternalEvents = () => {
  if (!isBrowser) return

  // 重写Event的原型方法
  const originalPreventDefault = Event.prototype.preventDefault
  
  Event.prototype.preventDefault = function() {
    // 检查事件是否是被动的
    if (this.cancelable === false) {
      console.warn('Attempted to call preventDefault() on a passive event, ignoring...')
      return
    }
    
    // 调用原始的preventDefault方法
    return originalPreventDefault.call(this)
  }

  // 重写TouchEvent的原型方法
  if (typeof TouchEvent !== 'undefined') {
    const originalTouchPreventDefault = TouchEvent.prototype.preventDefault
    
    TouchEvent.prototype.preventDefault = function() {
      if (this.cancelable === false) {
        console.warn('Attempted to call preventDefault() on a passive touch event, ignoring...')
        return
      }
      
      return originalTouchPreventDefault.call(this)
    }
  }

  // 重写WheelEvent的原型方法
  if (typeof WheelEvent !== 'undefined') {
    const originalWheelPreventDefault = WheelEvent.prototype.preventDefault
    
    WheelEvent.prototype.preventDefault = function() {
      if (this.cancelable === false) {
        console.warn('Attempted to call preventDefault() on a passive wheel event, ignoring...')
        return
      }
      
      return originalWheelPreventDefault.call(this)
    }
  }
}

// 修复React的合成事件系统
export const fixReactSyntheticEventSystem = () => {
  if (!isBrowser) return

  // 监听所有可能的事件，确保它们不是被动的
  const allEvents = [
    'touchstart', 'touchmove', 'touchend', 'touchcancel',
    'wheel', 'scroll', 'mousewheel', 'DOMMouseScroll'
  ]

  allEvents.forEach(eventType => {
    // 在捕获阶段添加非被动监听器
    document.addEventListener(eventType, (e) => {
      // 不做任何操作，只是确保事件不是被动的
    }, { passive: false, capture: true })

    // 在冒泡阶段也添加非被动监听器
    document.addEventListener(eventType, (e) => {
      // 不做任何操作，只是确保事件不是被动的
    }, { passive: false, capture: false })
  })
}

// 初始化修复
export const initEventFixes = () => {
  if (!isBrowser) return
  
  fixPassiveEventListeners()
  fixReactSyntheticEvents()
  fixReactInternalEvents()
  fixReactSyntheticEventSystem()
  
  console.log('Advanced event fixes applied successfully')
}

// 自动应用修复
if (isBrowser) {
  // 在DOM加载完成后应用修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventFixes)
  } else {
    initEventFixes()
  }
}
