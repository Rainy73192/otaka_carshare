import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(value)
  
  const currentValue = onValueChange ? value : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      'inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1.5 text-gray-500',
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function TabsTrigger({ value, children, className, onClick }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const isActive = context.value === value

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 移除 preventDefault() 以避免被动事件监听器错误
    context.onValueChange(value)
    onClick?.()
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    // 移除 preventDefault() 以避免被动事件监听器错误
    e.currentTarget.style.transform = 'scale(0.95)'
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    // 移除 preventDefault() 以避免被动事件监听器错误
    e.currentTarget.style.transform = 'scale(1)'
    context.onValueChange(value)
    onClick?.()
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 -webkit-tap-highlight-color: transparent -webkit-touch-callout: none -webkit-user-select: none',
        isActive && 'bg-white text-gray-900 shadow-sm',
        !isActive && 'text-gray-600 hover:text-gray-900',
        className
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        minHeight: '36px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }

  if (context.value !== value) {
    return null
  }

  return (
    <div className={cn('mt-2', className)}>
      {children}
    </div>
  )
}
