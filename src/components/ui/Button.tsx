'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold',
  ghost: 'bg-transparent hover:bg-white/5 text-[var(--text-secondary)] border border-[var(--border)]',
  danger: 'bg-red-600 hover:bg-red-500 text-white font-bold',
}

const sizeStyles = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-7 text-sm',
  lg: 'h-12 px-8 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
