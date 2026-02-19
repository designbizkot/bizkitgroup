"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineProject {
  id: string
  name: string
  client: string
  tag: "UX/UI" | "Website"
  progress: number
  startDate: string
  endDate: string
  avatar: string
}

const PROJECTS: TimelineProject[] = [
  {
    id: "1",
    name: "Dashboard: co...",
    client: "DashboardPro",
    tag: "UX/UI",
    progress: 40,
    startDate: "2026-02-03",
    endDate: "2026-02-08",
    avatar: "DP",
  },
  {
    id: "2",
    name: "Extension: show totals",
    client: "Extendify",
    tag: "Website",
    progress: 60,
    startDate: "2026-02-07",
    endDate: "2026-02-12",
    avatar: "EX",
  },
  {
    id: "3",
    name: "Help Docs: update scree...",
    client: "WebDocHub",
    tag: "Website",
    progress: 100,
    startDate: "2026-02-10",
    endDate: "2026-02-16",
    avatar: "WD",
  },
  {
    id: "4",
    name: "Dashboard Internal Design",
    client: "Bizkit",
    tag: "UX/UI",
    progress: 40,
    startDate: "2026-02-14",
    endDate: "2026-02-20",
    avatar: "BZ",
  },
]

export function ProjectTimeline() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()

  const todayDate = new Date()
  const isCurrentMonth =
    todayDate.getFullYear() === year &&
    todayDate.getMonth() === monthIndex

  const today = isCurrentMonth ? todayDate.getDate() : null

  const totalDays = new Date(year, monthIndex + 1, 0).getDate()

  const days = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays]
  )

  const monthLabel = currentDate.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  })

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1))
  }

  const goNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1))
  }

  return (
    <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-sm border border-gray-200">      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Project timeline
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="rounded-md border px-2 py-1 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium">
            {monthLabel}
            <ChevronDown size={14} />
          </div>

          <button
            onClick={goNextMonth}
            className="rounded-md border px-2 py-1 hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>

          <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100">
            Filter
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 flex-1 overflow-auto">
        <div
          className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
          style={{ minWidth: `${totalDays * 44}px` }}
        >
          {/* Day header */}
          <div className="flex border-b border-gray-200 bg-white py-2">
            {days.map((d) => (
              <div
                key={d}
                className="flex shrink-0 items-center justify-center text-xs"
                style={{ width: `${100 / totalDays}%` }}
              >
                {today === d ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F6F78] text-white font-bold">
                    {String(d).padStart(2, "0")}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    {String(d).padStart(2, "0")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="relative">
            {/* Vertical grid */}
            <div className="absolute inset-0 z-0 flex">
              {days.map((_, i) => (
                <div
                  key={i}
                  className="h-full border-r border-gray-200"
                  style={{ width: `${100 / totalDays}%` }}
                />
              ))}
            </div>

            {/* Today line */}
            {today && (
              <div
                className="absolute top-0 bottom-0 z-10 w-px bg-[#1F6F78]/30"
                style={{
                  left: `${((today - 0.5) / totalDays) * 100}%`,
                }}
              />
            )}

            {/* Projects */}
            <div className="relative z-20 flex flex-col gap-4 py-6 px-2">
              {PROJECTS.map((project) => {
                const start = new Date(project.startDate)
                const end = new Date(project.endDate)

                if (
                  start.getFullYear() !== year ||
                  start.getMonth() !== monthIndex
                )
                  return null

                const startDay = start.getDate()
                const endDay = end.getDate()

                const safeStartDay = Math.max(startDay, 1)
                const safeEndDay = Math.min(endDay, totalDays)

                const leftPct =
                  ((safeStartDay - 1) / totalDays) * 100

                const widthPct =
                  ((safeEndDay - safeStartDay + 1) /
                    totalDays) *
                  100

                return (
                  <div key={project.id} className="relative h-20">
                    <div
                      className={cn(
                        "absolute flex items-center rounded-2xl px-3 shadow-sm",
                        project.tag === "UX/UI"
                          ? "bg-[#D4E4DC]"
                          : "bg-[#B1CBD0]"
                      )}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height: "72px",
                      }}
                    >
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700">
                        {project.avatar}
                      </div>

                      {/* Content */}
                      <div className="ml-3 flex flex-1 flex-col justify-center">
                        <p className="truncate text-sm font-semibold text-gray-800 leading-tight">
                          {project.name}
                        </p>

                        <p className="text-xs text-gray-700 leading-tight mt-[2px]">
                          {project.client}
                        </p>

                        <span className="mt-1 inline-block w-fit rounded-md bg-[#1F6F78] px-2 py-[2px] text-[10px] font-semibold text-white">
                          {project.tag}
                        </span>
                      </div>

                      {/* Progress (ตรงกลางแนวตั้งแน่นอน) */}
                      <div className="ml-3 flex h-full items-center">
                        {project.progress === 100 ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F6F78] text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="flex h-7 items-center rounded-full bg-[#1F6F78] px-3 text-sm font-semibold text-white">
                            {project.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}