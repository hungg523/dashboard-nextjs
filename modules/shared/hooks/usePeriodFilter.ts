/**
 * Custom hook để quản lý period filter
 */

'use client'

import { useState } from 'react'
import { Period } from '@/modules/it-tickets/types'
import { getPeriodLabel, getPeriodDescription } from '@/modules/shared/utils/period'

export function usePeriodFilter(defaultPeriod: Period = 'this_month') {
  const [period, setPeriod] = useState<Period>(defaultPeriod)

  const selectPeriod = (newPeriod: Period) => {
    setPeriod(newPeriod)
  }

  const periodLabel = getPeriodLabel(period)
  const periodDescription = getPeriodDescription(period)

  return {
    period,
    selectPeriod,
    periodLabel,
    periodDescription,
  }
}
