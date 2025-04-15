"use client"

import { useEffect, useState } from "react"
import type { Task } from "@/lib/types"
import { getTasksByIds } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"

export default function TaskDependencies({ dependencies }: { dependencies: string[] }) {
  const [dependencyTasks, setDependencyTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const tasks = await getTasksByIds(dependencies)
        setDependencyTasks(tasks)
      } catch (error) {
        console.error("Failed to fetch dependencies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDependencies()
  }, [dependencies])

  if (loading) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-300 font-medium">Dependencies:</p>
        {Array.from({ length: dependencies.length }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-3">
      <p className="text-sm text-gray-300 font-medium">Dependencies:</p>
      <ul className="mt-1 space-y-1">
        {dependencyTasks.map((task) => (
          <li key={task._id} className="text-sm">
            <span className={`${task.completed ? "line-through text-gray-400" : "text-gray-300"}`}>{task.name}</span>
            <span className="text-xs ml-2 text-gray-400">({task.completed ? "Completed" : "Pending"})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
