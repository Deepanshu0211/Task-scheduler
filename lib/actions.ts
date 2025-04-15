"use server"

import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/db"
import { TaskModel, UserModel } from "@/lib/models"
import type { Task, TaskFormData, AiSuggestionInput, AiSuggestion, UserRegistrationData } from "@/lib/types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

// Helper to get the current user
async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/signin")
  }

  return session.user
}

// Register a new user
export async function registerUser(userData: UserRegistrationData) {
  try {
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create new user
    const user = new UserModel({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })

    await user.save()
    return { success: true }
  } catch (error: any) {
    console.error("Failed to register user:", error)
    throw new Error(error.message || "Failed to register user")
  }
}

// Get all tasks for the current user
export async function getTasks(): Promise<Task[]> {
  try {
    await connectToDatabase()

    // During build time, return empty array
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("Returning empty tasks array during build phase")
      return []
    }

    const user = await getCurrentUser()
    const tasks = await TaskModel.find({ userId: user.id }).sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(tasks))
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    // Return empty array instead of throwing during build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("Returning empty tasks array during build phase")
      return []
    }
    throw new Error("Failed to fetch tasks")
  }
}

// Get all tasks for the current user
export async function getAllTasks(): Promise<Task[]> {
  return getTasks()
}

// Get tasks by IDs for the current user
export async function getTasksByIds(ids: string[]): Promise<Task[]> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()
    const tasks = await TaskModel.find({
      _id: { $in: ids },
      userId: user.id,
    })

    return JSON.parse(JSON.stringify(tasks))
  } catch (error) {
    console.error("Failed to fetch tasks by IDs:", error)
    // Return empty array instead of throwing during build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return []
    }
    throw new Error("Failed to fetch tasks by IDs")
  }
}

// Create a new task for the current user
export async function createTask(taskData: TaskFormData): Promise<Task> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()

    const task = new TaskModel({
      ...taskData,
      deadline: taskData.deadline.toISOString(),
      reminderDate: taskData.reminderDate ? taskData.reminderDate.toISOString() : undefined,
      completed: false,
      userId: user.id,
    })

    await task.save()
    revalidatePath("/dashboard")
    return JSON.parse(JSON.stringify(task))
  } catch (error) {
    console.error("Failed to create task:", error)
    throw new Error("Failed to create task")
  }
}

// Update a task for the current user
export async function updateTask(id: string, taskData: TaskFormData): Promise<Task> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()

    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        ...taskData,
        deadline: taskData.deadline.toISOString(),
        reminderDate: taskData.reminderDate ? taskData.reminderDate.toISOString() : undefined,
      },
      { new: true },
    )

    if (!task) {
      throw new Error("Task not found or you don't have permission to update it")
    }

    revalidatePath("/dashboard")
    return JSON.parse(JSON.stringify(task))
  } catch (error) {
    console.error("Failed to update task:", error)
    throw new Error("Failed to update task")
  }
}

// Update task status for the current user
export async function updateTaskStatus(id: string, completed: boolean): Promise<Task> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()

    const task = await TaskModel.findOneAndUpdate({ _id: id, userId: user.id }, { completed }, { new: true })

    if (!task) {
      throw new Error("Task not found or you don't have permission to update it")
    }

    revalidatePath("/dashboard")
    return JSON.parse(JSON.stringify(task))
  } catch (error) {
    console.error("Failed to update task status:", error)
    throw new Error("Failed to update task status")
  }
}

// Delete a task for the current user
export async function deleteTask(id: string): Promise<void> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()

    const task = await TaskModel.findOneAndDelete({ _id: id, userId: user.id })

    if (!task) {
      throw new Error("Task not found or you don't have permission to delete it")
    }

    revalidatePath("/dashboard")
  } catch (error) {
    console.error("Failed to delete task:", error)
    throw new Error("Failed to delete task")
  }
}

// Get all unique categories for the current user
export async function getAllCategories(): Promise<string[]> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()
    const categories = await TaskModel.distinct("category", { userId: user.id })
    return categories.filter(Boolean) as string[]
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    // Return empty array instead of throwing during build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return []
    }
    throw new Error("Failed to fetch categories")
  }
}

// Get all unique tags for the current user
export async function getAllTags(): Promise<string[]> {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()
    const tasks = await TaskModel.find({ userId: user.id })

    // Extract all tags from all tasks
    const allTags = tasks.reduce((tags: string[], task) => {
      if (task.tags && Array.isArray(task.tags)) {
        return [...tags, ...task.tags]
      }
      return tags
    }, [])

    // Remove duplicates
    return [...new Set(allTags)]
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    return []
  }
}

// Get task statistics for the current user
export async function getTaskStatistics() {
  try {
    await connectToDatabase()

    const user = await getCurrentUser()

    const totalTasks = await TaskModel.countDocuments({ userId: user.id })
    const completedTasks = await TaskModel.countDocuments({ userId: user.id, completed: true })
    const pendingTasks = totalTasks - completedTasks

    // Tasks due today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dueTodayTasks = await TaskModel.countDocuments({
      userId: user.id,
      deadline: {
        $gte: today,
        $lt: tomorrow,
      },
      completed: false,
    })

    // Overdue tasks
    const overdueTasks = await TaskModel.countDocuments({
      userId: user.id,
      deadline: { $lt: today },
      completed: false,
    })

    // Tasks by priority
    const highPriorityTasks = await TaskModel.countDocuments({ userId: user.id, priority: "high", completed: false })
    const mediumPriorityTasks = await TaskModel.countDocuments({
      userId: user.id,
      priority: "medium",
      completed: false,
    })
    const lowPriorityTasks = await TaskModel.countDocuments({ userId: user.id, priority: "low", completed: false })

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      dueTodayTasks,
      overdueTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  } catch (error) {
    console.error("Failed to fetch task statistics:", error)
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      dueTodayTasks: 0,
      overdueTasks: 0,
      highPriorityTasks: 0,
      mediumPriorityTasks: 0,
      lowPriorityTasks: 0,
      completionRate: 0,
    }
  }
}

// Get AI suggestions for task
export async function getAiSuggestions(input: AiSuggestionInput): Promise<AiSuggestion> {
  try {
    // Get all tasks for context
    const allTasks = await getTasks()

    // Format tasks for AI context
    const tasksContext = allTasks.map((task) => ({
      id: task._id,
      name: task.name,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline,
      duration: task.duration,
      category: task.category,
      completed: task.completed,
      tags: task.tags,
    }))

    const prompt = `
      You are an AI assistant that helps with task management. Based on the task details and existing tasks, suggest:
      1. A priority level (high, medium, or low)
      2. An estimated duration in hours (can be decimal, e.g., 1.5)
      3. Potential dependencies (IDs of tasks that should be completed before this one)
      4. Relevant tags (3-5 keywords that describe this task)
      
      New task:
      Name: ${input.name}
      Description: ${input.description}
      Deadline: ${input.deadline}
      
      Existing tasks:
      ${JSON.stringify(tasksContext, null, 2)}
      
      Respond in JSON format only:
      {
        "priority": "high|medium|low",
        "duration": number,
        "dependencies": ["task_id1", "task_id2"],
        "tags": ["tag1", "tag2", "tag3"]
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the AI response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0])
        return {
          priority: jsonResponse.priority || "medium",
          duration: jsonResponse.duration || 1,
          dependencies: jsonResponse.dependencies || [],
          tags: jsonResponse.tags || [],
        }
      }

      // Fallback if JSON parsing fails
      return {
        priority: "medium",
        duration: 1,
        dependencies: [],
        tags: [],
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return {
        priority: "medium",
        duration: 1,
        dependencies: [],
        tags: [],
      }
    }
  } catch (error) {
    console.error("Failed to get AI suggestions:", error)
    throw new Error("Failed to get AI suggestions")
  }
}
