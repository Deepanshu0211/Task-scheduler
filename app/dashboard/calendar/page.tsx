export const dynamic = "force-dynamic"

import { getTasks } from "@/lib/actions"
import TaskCalendar from "@/components/task-calendar"


export default async function CalendarPage() {
  const tasks = await getTasks()

  return (
    
    <div className="space-y-6">
     
      <h1 className="text-3xl font-bold text-white">Calendar</h1>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <TaskCalendar tasks={tasks} />
      </div>
    </div>
  )
}
