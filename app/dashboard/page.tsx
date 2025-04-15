export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getTaskStatistics } from "@/lib/actions"
import DashboardCards from "@/components/dashboard-cards"
import TaskList from "@/components/task-list"
import { getTasks } from "@/lib/actions"
import LoadingTasks from "@/components/loading-tasks"


export default async function DashboardPage() {
  const stats = await getTaskStatistics()
  const tasks = await getTasks()

  // Filter for upcoming tasks (not completed, sorted by deadline)
  const upcomingTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  // Filter for recently completed tasks
  const recentlyCompletedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <DashboardCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Tasks</h2>
          <Suspense fallback={<LoadingTasks />}>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
              {upcomingTasks.length > 0 ? (
                <TaskList initialTasks={upcomingTasks} minimal />
              ) : (
                <p className="text-gray-400 text-center py-6">No upcoming tasks</p>
              )}
            </div>
          </Suspense>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recently Completed</h2>
          <Suspense fallback={<LoadingTasks />}>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
              {recentlyCompletedTasks.length > 0 ? (
                <TaskList initialTasks={recentlyCompletedTasks} minimal />
              ) : (
                <p className="text-gray-400 text-center py-6">No completed tasks</p>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
