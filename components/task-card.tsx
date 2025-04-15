"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Calendar, Edit, Trash2, LinkIcon, Tag, Bell, ChevronDown, ChevronUp } from "lucide-react"
import { deleteTask, updateTaskStatus } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import EditTaskDialog from "@/components/edit-task-dialog"
import TaskDependencies from "@/components/task-dependencies"

export default function TaskCard({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDependencies, setShowDependencies] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteTask(task._id)
      toast({
        title: "Task deleted",
        description: `"${task.name}" has been removed.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
        <CardHeader className="px-3 py-2 sm:px-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-start gap-1 min-w-0">
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={handleStatusChange} 
                className="mt-1 flex-shrink-0" 
              />
              <CardTitle className={`text-base sm:text-lg truncate ${task.completed ? "line-through text-gray-400" : "text-white"}`}>
                {task.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                {task.priority}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 w-6" 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showDetails && (
          <CardContent className="px-3 pb-1 pt-0 sm:px-4">
            {task.description && (
              <p className="text-gray-300 mb-3 text-xs sm:text-sm">{task.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{format(new Date(task.deadline), "MMM d, yyyy")}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <Clock className="h-3 w-3 mr-1" />
                <span>{task.duration} {task.duration === 1 ? "hour" : "hours"}</span>
              </div>

              {task.category && (
                <div className="flex items-center text-gray-300">
                  <Tag className="h-3 w-3 mr-1" />
                  <span className="truncate">{task.category}</span>
                </div>
              )}

              {task.reminderDate && (
                <div className="flex items-center text-gray-300">
                  <Bell className="h-3 w-3 mr-1" />
                  <span>{format(new Date(task.reminderDate), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>

            {task.dependencies && task.dependencies.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowDependencies(!showDependencies)}
                  className="flex items-center text-blue-300 hover:underline text-xs mb-1"
                >
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {task.dependencies.length} {task.dependencies.length === 1 ? "dependency" : "dependencies"}
                </button>
                
                {showDependencies && <TaskDependencies dependencies={task.dependencies} />}
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-gray-800/50 text-gray-300 border-gray-700 text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className="px-3 py-2 sm:px-4">
          <div className="flex justify-end gap-1 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-white/5 border-white/20 hover:bg-white/10 h-7 text-xs px-2"
            >
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-none h-7 text-xs px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isEditing && <EditTaskDialog task={task} open={isEditing} onOpenChange={setIsEditing} />}
    </>
  )
}
