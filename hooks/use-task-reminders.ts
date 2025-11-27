"use client"

import { useState, useEffect } from "react"

interface TaskReminders {
  pendingCount: number
  inProgressCount: number
  suggestedTasks: any[]
}

export function useTaskReminders(period: string) {
  const [reminders, setReminders] = useState<TaskReminders | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true)
      try {
        const currentUser = localStorage.getItem('currentUser')
        if (!currentUser) {
          setLoading(false)
          return
        }

        const user = JSON.parse(currentUser)
        const response = await fetch(
          `/api/taskreminder/suggestions?userId=${user.id}&period=${period}`
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setReminders({
              pendingCount: result.data.statistics?.newTasks || 0,
              inProgressCount: result.data.statistics?.inProgressTasks || 0,
              suggestedTasks: result.data.suggestedTasks || []
            })
          }
        }
      } catch (error) {
        console.error('Task reminders fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [period])

  return { reminders, loading }
}
