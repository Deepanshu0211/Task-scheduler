"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TaskDependencySelectProps {
  value: string[]
  onChange: (value: string[]) => void
  onOpen?: () => void
  tasks: Task[]
}

export default function TaskDependencySelect({ value, onChange, onOpen, tasks }: TaskDependencySelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (taskId: string) => {
    const newValue = value.includes(taskId) ? value.filter((id) => id !== taskId) : [...value, taskId]
    onChange(newValue)
  }

  const handleRemove = (taskId: string) => {
    onChange(value.filter((id) => id !== taskId))
  }

  const getTaskName = (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId)
    return task ? task.name : "Unknown task"
  }

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (isOpen && onOpen) onOpen()
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-700/50 border-gray-600 hover:bg-gray-700"
          >
            <span className="truncate">
              {value.length > 0
                ? `${value.length} ${value.length === 1 ? "dependency" : "dependencies"} selected`
                : "Select dependencies"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-700 border-gray-600">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search tasks..." className="text-white" />
            <CommandList>
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <CommandItem
                    key={task._id}
                    value={task._id}
                    onSelect={() => handleSelect(task._id)}
                    className={cn("flex items-center gap-2 text-white", task.completed && "text-gray-400 line-through")}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value.includes(task._id) ? "opacity-100" : "opacity-0")} />
                    {task.name}
                    {task.completed && <span className="ml-auto text-xs text-gray-400">(Completed)</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((taskId) => (
            <Badge key={taskId} variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white">
              {getTaskName(taskId)}
              <button
                type="button"
                onClick={() => handleRemove(taskId)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
