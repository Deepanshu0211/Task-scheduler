"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Task, TaskFormData } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sparkles, X, Plus, Bell } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createTask, getAllTasks, getAiSuggestions } from "@/lib/actions"
import TaskDependencySelect from "@/components/task-dependency-select"
import { Badge } from "@/components/ui/badge"

const taskFormSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  deadline: z.date(),
  duration: z.coerce
    .number()
    .min(0.5, "Duration must be at least 30 minutes")
    .max(24, "Duration must be at most 24 hours"),
  category: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  reminderDate: z.date().optional().nullable(),
})

export default function AddTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [availableTasks, setAvailableTasks] = useState<Task[]>([])
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "medium",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 1,
      category: "",
      dependencies: [],
      tags: [],
      reminderDate: null,
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true)
      await createTask(data)
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const tasks = await getAllTasks()
      setAvailableTasks(tasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    }
  }

  const generateAiSuggestions = async () => {
    const taskName = form.getValues("name")
    const taskDescription = form.getValues("description")
    const deadline = form.getValues("deadline")

    if (!taskName) {
      toast({
        title: "Task name required",
        description: "Please enter a task name to generate suggestions.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGeneratingSuggestions(true)
      const suggestions = await getAiSuggestions({
        name: taskName,
        description: taskDescription || "",
        deadline: deadline.toISOString(),
      })

      if (suggestions) {
        form.setValue("priority", suggestions.priority as "high" | "medium" | "low")
        form.setValue("duration", suggestions.duration)

        if (suggestions.dependencies && suggestions.dependencies.length > 0) {
          // Load tasks if not already loaded
          if (availableTasks.length === 0) {
            await loadTasks()
          }

          form.setValue("dependencies", suggestions.dependencies)
        }

        if (suggestions.tags && suggestions.tags.length > 0) {
          form.setValue("tags", suggestions.tags)
        }

        toast({
          title: "AI suggestions applied",
          description: "Task priority, duration, dependencies, and tags have been suggested.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const addTag = () => {
    if (!tagInput.trim()) return

    const currentTags = form.getValues("tags") || []
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()])
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[200px] bg-gray-800/95 backdrop-blur-xl border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAiSuggestions}
                disabled={isGeneratingSuggestions}
                className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isGeneratingSuggestions ? "Generating..." : "AI Suggestions"}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} className="bg-gray-700/50 border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description"
                      {...field}
                      className="bg-gray-700/50 border-gray-600 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-700/50 border-gray-600",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-gray-700"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} className="bg-gray-700/50 border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Work, Personal" {...field} className="bg-gray-700/50 border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reminder (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-gray-700/50 border-gray-600",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Set a reminder</span>}
                          <Bell className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600">
                      <div className="p-2">
                        <Button variant="ghost" className="text-sm text-gray-300" onClick={() => field.onChange(null)}>
                          Clear
                        </Button>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-gray-700"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dependencies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dependencies</FormLabel>
                  <FormControl>
                    <TaskDependencySelect
                      value={field.value || []}
                      onChange={field.onChange}
                      onOpen={loadTasks}
                      tasks={availableTasks}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      className="bg-gray-700/50 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                      className="bg-gray-700/50 border-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-gray-700/50 border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
