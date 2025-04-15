"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CheckSquare, Calendar, Menu, X, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tasks",
      path: "/dashboard/tasks",
      icon: CheckSquare,
    },
    {
      name: "Calendar",
      path: "/dashboard/calendar",
      icon: Calendar,
    },
    {
      name: "Activity",
      path: "/dashboard/analytics",
      icon: Activity,
    },
  ]

  // Handle swipe gesture
  useEffect(() => {
    const handleTouchStart = (e) => {
      setTouchStartX(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
      setTouchEndX(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      // If swipe distance is more than 70px and started from near the left edge
      if (touchEndX - touchStartX > 70 && touchStartX < 30) {
        setIsOpen(true)
      }
      
      // Close on swipe left when sidebar is open
      if (touchStartX - touchEndX > 70 && isOpen) {
        setIsOpen(false)
      }
    }

    // Add event listeners to document body for detecting swipes anywhere on screen
    document.body.addEventListener('touchstart', handleTouchStart)
    document.body.addEventListener('touchmove', handleTouchMove)
    document.body.addEventListener('touchend', handleTouchEnd)

    return () => {
      // Clean up event listeners
      document.body.removeEventListener('touchstart', handleTouchStart)
      document.body.removeEventListener('touchmove', handleTouchMove)
      document.body.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStartX, touchEndX, isOpen])

     return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed inset-y-2 left-4 z-40 w-12 transform bg-gray-900/95 backdrop-blur-lg border-r border-white/10 transition-transform duration-200 ease-in-out md:translate-x-0 mb-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900/95 backdrop-blur-lg border-r border-white/10 transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">TaskAI</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  pathname === route.path
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <route.icon className="h-5 w-5 mr-3" />
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
