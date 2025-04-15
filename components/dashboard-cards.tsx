import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertTriangle, BarChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface DashboardCardsProps {
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
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <Progress value={stats.completionRate} className="h-2 mt-2 bg-gray-700" indicatorClassName="bg-green-500" />
          <p className="text-xs text-gray-400 mt-2">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dueTodayTasks}</div>
          <p className="text-xs text-gray-400 mt-2">Tasks that need to be completed today</p>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overdueTasks}</div>
          <p className="text-xs text-gray-400 mt-2">Tasks that are past their deadline</p>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <BarChart className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.highPriorityTasks}</div>
          <p className="text-xs text-gray-400 mt-2">Tasks marked as high priority</p>
        </CardContent>
      </Card>
    </div>
  )
}
