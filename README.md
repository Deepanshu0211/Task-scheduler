# 🧠 TaskScheduler

> Personal task management dashboard — built for clarity, speed, and ✨vibes✨.

This is a private project meant to keep my productivity flow clean and customized.  
Not open-source (yet 😌), just living in my GitHub repo like a lil organized workspace.

---

## 🔍 Overview

A sleek task scheduler with:

- ✅ Task management (CRUD)
- 📅 Calendar view
- 📊 Dashboard with stats
- 📂 Task filtering & priorities
- 🌙 Responsive UI with swipe sidebar for mobile
- 🤖 AI-powered suggestions (planned)

---

## 💻 Tech Stack

- **Next.js 13** (App Router)
- **React**
- **Tailwind CSS** + ShadCN UI
- **Zod** + React Hook Form
- **Lucide** for icons
- **NextAuth** for session auth
- **(Backend)** – connected to `getTasks` & `getTaskStatistics` from custom API

---

## 📂 Structure

```bash
/components        # UI Components (TaskList, Sidebar, Filters, etc.)
/lib               # Helper functions & actions (getTasks, etc.)
/pages or /app     # Route logic
/public            # Static files

```

## 🧪 Dev Setup

```bash
npm install
npm run dev
```

Make sure your `.env` has the required keys:

- `NEXTAUTH_SECRET=...`
- `DATABASE_URL=...`

---

## 🛠️ To-Do List

- [x] Create responsive sidebar with swipe support
- [x] Add mobile menu toggle button
- [x] Setup basic task CRUD
- [x] Dashboard with upcoming + completed tasks
- [x] AI-powered task suggestions (priority, tags)
- [ ] Notifications / reminders
- [ ] Recurring tasks support
- [ ] User settings (theme, profile)
- [ ] Offline support (PWA maybe?)
- [ ] Deploy with env setup & error boundaries

## 🔗 Live Demo

Check out the app live here:  
👉 [Task Scheduler](https://taskscheduler-lemon.vercel.app/)

---

## 🔥Note 

Oh hey there 👋,  
So you stumbled in here like a lost puppy tryna steal some code? Cute.  
You probably typed “cool Next.js dashboard GitHub” and landed here like it’s your lucky day 💀

Let me make this crystal clear:

> 🧠 **This isn’t your average tutorial BS.**  
> 💅 This is custom-coded chaos, brewed in pain, caffeine, and way too much Tailwind.

You can fork it, sure. But you can’t **copy the drip**.  
Go ahead, slap your name on it. We’ll all know.  
You're like the kid who copies homework but forgets to change the name 💀

**Built different:**
- Next.js 13 App Router 🔥
- Tailwind, obviously 🙄
- Server actions that slap
- Sidebar that slides harder than your ex’s DMs
- Mobile swipe gestures like it’s Tinder for tasks

So yeah... fork it. Clone it. Heck, deploy it.  
But if you don’t drop a star ⭐ while you’re at it?  
I hope your project breaks in prod with no error logs 😌

Stay toxic 🖤  
