/**
 * Biểu đồ horizontal bar top 5 người xử lý nhiều phiếu nhất
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { TopHandlersData } from '@/modules/it-tickets/types'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'

export default function TopHandlersChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await ITTicketService.getTopHandlers(5)
      
      if (!data || !canvasRef.current) return

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy()
      }

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const chartData = {
        labels: data.handlers || [],
        datasets: [
          {
            label: 'Đã hoàn thành',
            data: data.completedCounts || [],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          },
          {
            label: 'Tổng số',
            data: data.totalCounts || [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      }

      const config: ChartConfiguration = {
        type: 'bar',
        data: chartData,
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeInOutCubic'
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.x} phiếu`
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      }

      chartRef.current = new Chart(ctx, config)
    } catch (error) {
      console.error('[TopHandlersChart] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  )
}
