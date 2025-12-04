/**
 * Biểu đồ donut phân loại phiếu theo trạng thái
 */
'use client'

import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { DashboardKPI } from '@/modules/it-tickets/types'

interface StatusChartProps {
  data: DashboardKPI
}

export default function StatusChart({ data }: StatusChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const chartData = {
      labels: ['Đã hoàn thành', 'Đang xử lý', 'Chờ xử lý'],
      datasets: [{
        data: [
          data.completedTickets || 0,
          data.inProgressTickets || 0,
          data.pendingTickets || 0
        ],
        backgroundColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12, weight: 500 },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels && data.labels.length && data.datasets.length) {
                  const total = data.datasets[0].data.reduce((a: number, b: any) => a + (b as number), 0)
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                      hidden: false,
                      index: i
                    }
                  })
                }
                return []
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} phiếu (${percentage}%)`
              }
            }
          }
        }
      }
    }

    chartRef.current = new Chart(ctx, config)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
