"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { getAllCategories } from "@/lib/actions"

export default function TaskFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  const priority = searchParams.get("priority") || ""
  const status = searchParams.get("status") || ""
  const category = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || ""

  const hasFilters = priority || status || category || sort

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await getAllCategories()
        setCategories(categoryList)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/")
  }

  return (
    <div className="w-full md:w-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/10 border-white/20 hover:bg-white/15"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasFilters && (
            <span className="ml-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
              {[priority, status, category, sort].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Priority</label>
            <Select value={priority} onValueChange={(value) => updateFilters("priority", value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <Select value={status} onValueChange={(value) => updateFilters("status", value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <Select value={category} onValueChange={(value) => updateFilters("category", value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
            <Select value={sort} onValueChange={(value) => updateFilters("sort", value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="deadline-asc">Deadline (Earliest)</SelectItem>
                <SelectItem value="deadline-desc">Deadline (Latest)</SelectItem>
                <SelectItem value="priority">Priority (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
