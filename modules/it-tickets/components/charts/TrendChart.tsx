/**
 * Biểu đồ line xu hướng phiếu IT (tổng và hoàn thành)
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { TrendChartData } from '@/modules/it-tickets/types'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'

export default function TrendChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await ITTicketService.getTrendHistory(6)
      
      if (!data || !canvasRef.current) return

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy()
      }

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const chartData = {
        labels: data.months || [],
        datasets: [
          {
            label: 'Tổng phiếu',
            data: data.total || [],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: false,
            pointRadius: 4
          },
          {
            label: 'Đã hoàn thành',
            data: data.completed || [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 4
          }
        ]
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
            legend: { display: true, position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.y ?? 0} phiếu`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 10
              }
            }
          }
        }
      }

      chartRef.current = new Chart(ctx, config)
    } catch (error) {
      console.error('[TrendChart] Error loading data:', error)
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
