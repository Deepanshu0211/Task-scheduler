export const dynamic = "force-dynamic"

import { Suspense } from "react"
import TaskList from "@/components/task-list"
import AddTaskButton from "@/components/add-task-button"
import TaskFilters from "@/components/task-filters"
import { getTasks } from "@/lib/actions"
import LoadingTasks from "@/components/loading-tasks"


export default async function TasksPage() {
  const tasks = await getTasks()

  return (
 
    <div className="space-y-6">
     
      <h1 className="text-3xl font-bold text-white">Tasks</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TaskFilters />
        <AddTaskButton />
      </div>

      <Suspense fallback={<LoadingTasks />}>
        <TaskList initialTasks={tasks} />
      </Suspense>
    </div>
  )
}
