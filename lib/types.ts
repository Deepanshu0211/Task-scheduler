export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface Task {
  _id: string
  name: string
  description?: string
  priority: string
  deadline: string
  duration: number
  category?: string
  dependencies?: string[]
  completed: boolean
  createdAt: string
  updatedAt: string
  userId: string
  tags?: string[]
  reminderDate?: string
}

export type TaskFormData = {
  name: string
  description?: string
  priority: "high" | "medium" | "low"
  deadline: Date
  duration: number
  category?: string
  dependencies?: string[]
  tags?: string[]
  reminderDate?: Date
}

export type AiSuggestionInput = {
  name: string
  description: string
  deadline: string
}

export type AiSuggestion = {
  priority: string
  duration: number
  dependencies?: string[]
  tags?: string[]
}

export type UserRegistrationData = {
  name: string
  email: string
  password: string
}
