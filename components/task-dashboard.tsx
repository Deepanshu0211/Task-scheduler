export const dynamic = "force-dynamic"

import { Suspense } from "react"
import TaskList from "@/components/task-list"
import AddTaskButton from "@/components/add-task-button"
import TaskFilters from "@/components/task-filters"
import { getTasks } from "@/lib/actions"

export default async function TaskDashboard() {
  const tasks = await getTasks()

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TaskFilters />
        <AddTaskButton />
      </div>

      <Suspense fallback={<p className="text-white">Loading tasks...</p>}>
        <TaskList initialTasks={tasks} />
      </Suspense>
    </div>
  )
}
