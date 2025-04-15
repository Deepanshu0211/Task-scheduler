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
import { CalendarIcon, X, Plus, Bell } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { updateTask, getAllTasks } from "@/lib/actions"
import TaskDependencySelect from "@/components/task-dependency-select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableTasks, setAvailableTasks] = useState<Task[]>([])
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: task.name,
      description: task.description || "",
      priority: task.priority as "high" | "medium" | "low",
      deadline: new Date(task.deadline),
      duration: task.duration,
      category: task.category || "",
      dependencies: task.dependencies || [],
      tags: task.tags || [],
      reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true)
      await updateTask(task._id, data)
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const tasks = await getAllTasks()
      // Filter out the current task to avoid circular dependencies
      setAvailableTasks(tasks.filter((t) => t._id !== task._id))
    } catch (error) {
      console.error("Failed to load tasks:", error)
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
      <DialogContent className="max-w-[450px] w-[90%] p-0 bg-[#1e2633] border-0 text-white overflow-y-auto max-h-[60vh] ">
        <div className="p-4 pb-3">
          <DialogHeader className="pb-2">
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">Task Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter task name" 
                        {...field} 
                        className="bg-[#242c3b] border-0 h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        {...field}
                        className="bg-[#242c3b] border-0 resize-none min-h-[80px] text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#242c3b] border-0 h-10 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#242c3b] border-0">
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-[#242c3b] border-0 h-10 text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "MMM dd, yyyy") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#242c3b] border-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="bg-[#242c3b]"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
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
                      <FormLabel className="text-sm font-normal">Duration (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          {...field} 
                          className="bg-[#242c3b] border-0 h-10 text-sm" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">Category</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Work, Personal" 
                          {...field} 
                          className="bg-[#242c3b] border-0 h-10 text-sm" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">Reminder (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-[#242c3b] border-0 h-10 text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "MMM dd, yyyy") : <span>Set a reminder</span>}
                            <Bell className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#242c3b] border-0">
                        <div className="p-2">
                          <Button 
                            variant="ghost" 
                            className="text-xs text-gray-300" 
                            onClick={() => field.onChange(null)}
                          >
                            Clear
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-[#242c3b]"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">Dependencies</FormLabel>
                    <FormControl>
                      <TaskDependencySelect
                        value={field.value || []}
                        onChange={field.onChange}
                        onOpen={loadTasks}
                        tasks={availableTasks}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">Tags</FormLabel>
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
                        className="bg-[#242c3b] border-0 h-10 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addTag}
                        className="bg-[#242c3b] border-0 h-10 w-10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-[#242c3b] text-gray-300 border-gray-600 text-xs py-0"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full outline-none focus:ring-1"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#242c3b] border-0 hover:bg-[#2a3446] text-sm h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-blue-600 hover:bg-blue-700 text-sm h-9"
                >
                  {isLoading ? "Updating..." : "Update Task"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
