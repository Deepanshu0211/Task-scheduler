"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import TaskCard from "@/components/task-card"
import MinimalTaskCard from "@/components/minimal-task-card"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

interface TaskListProps {
  initialTasks: Task[]
  minimal?: boolean
}

export default function TaskList({ initialTasks, minimal = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const searchParams = useSearchParams()

  // Filter tasks based on URL parameters
  useEffect(() => {
    if (minimal) {
      setTasks(initialTasks)
      return
    }

    let filteredTasks = [...initialTasks]

    const priority = searchParams.get("priority")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const sort = searchParams.get("sort")
    const search = searchParams.get("search")

    if (priority && priority !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.priority === priority)
    }

    if (status && status !== "all") {
      const isCompleted = status === "completed"
      filteredTasks = filteredTasks.filter((task) => task.completed === isCompleted)
    }

    if (category && category !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.category === category)
    }

    if (tag && tag !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.tags?.includes(tag))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)),
      )
    }

    if (sort) {
      switch (sort) {
        case "deadline-asc":
          filteredTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          break
        case "deadline-desc":
          filteredTasks.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
          break
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          filteredTasks.sort(
            (a, b) =>
              priorityOrder[a.priority as keyof typeof priorityOrder] -
              priorityOrder[b.priority as keyof typeof priorityOrder],
          )
          break
        case "created-desc":
          filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case "created-asc":
          filteredTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
      }
    }

    setTasks(filteredTasks)
  }, [initialTasks, searchParams, minimal])

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
        <h3 className="text-xl font-medium text-white mb-2">No tasks found</h3>
        <p className="text-gray-300">Try adjusting your filters or add a new task</p>
      </div>
    )
  }

  if (minimal) {
    return (
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MinimalTaskCard task={task} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
