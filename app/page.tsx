import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">TaskAI</h1>
          <div className="flex gap-4">
            <Link href="/signin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Manage Your Tasks with AI</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              TaskAI helps you organize your work with intelligent suggestions for priorities, durations, and
              dependencies.
            </p>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white/5 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h4 className="text-xl font-semibold text-white mb-3">AI-Powered Suggestions</h4>
                <p className="text-gray-300">
                  Get intelligent suggestions for task priorities, durations, and dependencies based on your existing
                  tasks.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h4 className="text-xl font-semibold text-white mb-3">Personal Task Management</h4>
                <p className="text-gray-300">
                  Each user has their own private task list. Organize, filter, and sort your tasks however you want.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h4 className="text-xl font-semibold text-white mb-3">Beautiful Interface</h4>
                <p className="text-gray-300">Enjoy a modern, glassmorphism UI that makes task management a pleasure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} TaskAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
