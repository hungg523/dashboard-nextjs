/**
 * Biểu đồ line tỷ lệ hoàn thành theo tháng
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { CompletionChartData } from '@/modules/it-tickets/types'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'

export default function CompletionChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await ITTicketService.getCompletionHistory(6)
      
      if (!data || !canvasRef.current) return

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy()
      }

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const chartData = {
        labels: data.months || [],
        datasets: [{
          label: 'Tỷ lệ hoàn thành (%)',
          data: data.completionRates || [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      }

      const config: ChartConfiguration = {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Tỷ lệ: ${(context.parsed.y ?? 0).toFixed(1)}%`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => value + '%'
              }
            }
          }
        }
      }

      chartRef.current = new Chart(ctx, config)
    } catch (error) {
      console.error('[CompletionChart] Error loading data:', error)
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
