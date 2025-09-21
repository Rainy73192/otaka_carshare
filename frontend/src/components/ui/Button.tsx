import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  onClick,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed -webkit-tap-highlight-color: transparent -webkit-touch-callout: none -webkit-user-select: none'
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-soft hover:shadow-medium focus:ring-primary-500 transform hover:scale-105 active:scale-95',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 shadow-soft hover:shadow-medium focus:ring-gray-500 transform hover:scale-105 active:scale-95',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 shadow-soft hover:shadow-medium focus:ring-primary-500 transform hover:scale-105 active:scale-95',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[44px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  }

  // 简化的点击处理
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        minHeight: '44px', // iOS 推荐的最小触摸目标
        cursor: 'pointer'
      }}
      {...props}
    >
      {children}
    </button>
  )
}
