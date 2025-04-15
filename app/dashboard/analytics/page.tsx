export const dynamic = "force-dynamic"

import { getTaskStatistics, getTasks } from "@/lib/actions"
import TaskAnalytics from "@/components/task-analytics"


export default async function AnalyticsPage() {
  const stats = await getTaskStatistics()
  const tasks = await getTasks()

  return (
  
    <div className="space-y-6">
      
      <h1 className="text-3xl font-bold text-white">Analytics</h1>

      <TaskAnalytics stats={stats} tasks={tasks} />
    </div>
  )
}
