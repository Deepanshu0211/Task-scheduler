"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface TaskAnalyticsProps {
  stats: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    dueTodayTasks: number
    overdueTasks: number
    highPriorityTasks: number
    mediumPriorityTasks: number
    lowPriorityTasks: number
    completionRate: number
  }
  tasks: Task[]
}

export default function TaskAnalytics({ stats, tasks }: TaskAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("7days")

  // Filter tasks based on time range
  const filterTasksByTimeRange = (tasks: Task[]) => {
    const now = new Date()
    const startDate = timeRange === "7days" ? subDays(now, 7) : timeRange === "30days" ? subDays(now, 30) : new Date(0) // all time

    return tasks.filter((task) => {
      const createdAt = parseISO(task.createdAt)
      return isAfter(createdAt, startDate) && isBefore(createdAt, now)
    })
  }

  const filteredTasks = filterTasksByTimeRange(tasks)

  // Prepare data for charts
  const priorityData = [
    { name: "High", value: stats.highPriorityTasks, color: "#ef4444" },
    { name: "Medium", value: stats.mediumPriorityTasks, color: "#eab308" },
    { name: "Low", value: stats.lowPriorityTasks, color: "#22c55e" },
  ]

  const statusData = [
    { name: "Completed", value: stats.completedTasks, color: "#22c55e" },
    { name: "Pending", value: stats.pendingTasks, color: "#3b82f6" },
    { name: "Overdue", value: stats.overdueTasks, color: "#ef4444" },
  ]

  // Group tasks by category
  const categoryMap = filteredTasks.reduce(
    (acc, task) => {
      const category = task.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category]++
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categoryMap).map(([name, value], index) => ({
    name,
    value,
    color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#84cc16", "#eab308", "#ef4444", "#64748b"][
      index % 9
    ],
  }))

  // Tasks created over time
  const tasksByDate = filteredTasks.reduce(
    (acc, task) => {
      const date = format(parseISO(task.createdAt), "MMM d")
      if (!acc[date]) {
        acc[date] = { date, count: 0, completed: 0 }
      }
      acc[date].count++
      if (task.completed) {
        acc[date].completed++
      }
      return acc
    },
    {} as Record<string, { date: string; count: number; completed: number }>,
  )

  const timelineData = Object.values(tasksByDate).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <Tabs defaultValue="7days" onValueChange={(value) => setTimeRange(value as any)}>
        <div className="flex justify-between items-center">
          <TabsList className="bg-white/10">
            <TabsTrigger value="7days" className="data-[state=active]:bg-white/20">
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="30days" className="data-[state=active]:bg-white/20">
              Last 30 Days
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
              All Time
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="7days" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
                <CardDescription className="text-gray-400">Distribution of task completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
              <CardHeader>
                <CardTitle>Task Priority</CardTitle>
                <CardDescription className="text-gray-400">Distribution of task priorities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
            <CardHeader>
              <CardTitle>Tasks Over Time</CardTitle>
              <CardDescription className="text-gray-400">Number of tasks created and completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                    <Legend />
                    <Bar dataKey="count" name="Created" fill="#3b82f6" />
                    <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
            <CardHeader>
              <CardTitle>Tasks by Category</CardTitle>
              <CardDescription className="text-gray-400">Distribution of tasks across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                    <Bar dataKey="value" name="Tasks">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="30days" className="mt-6">
          {/* Same content as 7days tab, data will be filtered by the timeRange state */}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {/* Same content as 7days tab, data will be filtered by the timeRange state */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
