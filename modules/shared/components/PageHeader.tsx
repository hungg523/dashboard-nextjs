/**
 * Component Header chung cho các trang
 */

'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  children?: ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-medium text-slate-800">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  )
}
