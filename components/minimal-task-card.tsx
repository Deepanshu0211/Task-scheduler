"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { updateTaskStatus } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import EditTaskDialog from "@/components/edit-task-dialog"

export default function MinimalTaskCard({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const priorityColors = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    low: "bg-green-500/20 text-green-300 border-green-500/30",
  }

  const handleStatusChange = async () => {
    try {
      await updateTaskStatus(task._id, !task.completed)
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task completed",
        description: `"${task.name}" has been updated.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div
        className="p-3 rounded-lg backdrop-blur-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={task.completed} onCheckedChange={handleStatusChange} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`text-sm font-medium truncate ${task.completed ? "line-through text-gray-400" : "text-white"}`}
              >
                {task.name}
              </h3>
              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>{task.priority}</Badge>
            </div>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <span>Due: {format(new Date(task.deadline), "MMM d, yyyy")}</span>
              {task.category && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-700/50">{task.category}</span>}
            </div>
          </div>
        </div>
      </div>

      {isEditing && <EditTaskDialog task={task} open={isEditing} onOpenChange={setIsEditing} />}
    </>
  )
}
