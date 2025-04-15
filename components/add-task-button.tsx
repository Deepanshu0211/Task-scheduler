"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AddTaskDialog from "@/components/add-task-dialog"

export default function AddTaskButton() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      >
        <Plus className="h-5 w-5 mr-2" /> Add Task
      </Button>

      <AddTaskDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
