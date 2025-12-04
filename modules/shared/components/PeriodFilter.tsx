/**
 * Component Period Filter - Bộ lọc thời gian
 */

'use client'

import { ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Period } from '@/modules/it-tickets/types'
import { getPeriodLabel } from '@/modules/shared/utils/period'

interface PeriodFilterProps {
  value: Period
  onChange: (period: Period) => void
  description?: string
}

const periodOptions: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'all', label: '6 tháng qua' },
]

export function PeriodFilter({ value, onChange, description }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (period: Period) => {
    onChange(period)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-sm font-medium text-slate-700 cursor-pointer"
        >
          <span>{getPeriodLabel(value)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors flex items-center justify-between first:rounded-t-lg last:rounded-b-lg cursor-pointer"
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {description && (
        <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">{description}</span>
        </div>
      )}
    </div>
  )
}
