"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import EditTaskDialog from "@/components/edit-task-dialog"

interface TaskCalendarProps {
  tasks: Task[]
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.deadline), day))
  }

  const priorityColors = {
    high: "bg-red-500/20 border-red-500/30",
    medium: "bg-yellow-500/20 border-yellow-500/30",
    low: "bg-green-500/20 border-green-500/30",
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="bg-white/5 border-white/20">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="bg-white/5 border-white/20">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-24 p-2 border border-white/10 rounded-md",
                isCurrentMonth ? "bg-white/5" : "bg-white/2 text-gray-500",
              )}
            >
              <div className="text-right text-sm mb-1">{format(day, "d")}</div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className={cn(
                      "text-xs p-1 rounded truncate cursor-pointer border",
                      priorityColors[task.priority as keyof typeof priorityColors],
                      task.completed ? "opacity-50 line-through" : "",
                    )}
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.name}
                  </div>
                ))}

                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-400 text-center">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <EditTaskDialog task={selectedTask} open={!!selectedTask} onOpenChange={() => setSelectedTask(null)} />
      )}
    </>
  )
}
