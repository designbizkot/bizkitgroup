"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineProject {
  id: string
  name: string
  client: string
  tag: string
  tagColor: string
  progress: number
  startDay: number
  endDay: number
  avatar: string
  done?: boolean
}

const PROJECTS: TimelineProject[] = [
  {
    id: "1",
    name: "Dashboard: co...",
    client: "DashboardPro",
    tag: "UX/UI",
    tagColor: "bg-[#166a7d]",
    progress: 40,
    startDay: 3,
    endDay: 8,
    avatar: "DP",
  },
  {
    id: "2",
    name: "Extension: show totals",
    client: "Extendify",
    tag: "Website",
    tagColor: "bg-[#458897]",
    progress: 60,
    startDay: 7,
    endDay: 12,
    avatar: "EX",
  },
  {
    id: "3",
    name: "Help Docs: update scree...",
    client: "WebDocHub",
    tag: "Website",
    tagColor: "bg-[#458897]",
    progress: 100,
    startDay: 10,
    endDay: 16,
    avatar: "WD",
    done: true,
  },
  {
    id: "4",
    name: "Dashboard Internal Design",
    client: "Bizkit",
    tag: "UX/UI",
    tagColor: "bg-[#166a7d]",
    progress: 40,
    startDay: 14,
    endDay: 20,
    avatar: "BZ",
  },
]

export function ProjectTimeline() {
  const [month, setMonth] = useState("Feb, 2026")
  const today = 10
  const totalDays = 22

  const days = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [])

  return (
    <section className="rounded-xl bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          Project timeline
        </h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
            {month}
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
            Filter
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="mt-4 overflow-x-auto">
        <div style={{ minWidth: `${totalDays * 44}px` }}>
          {/* Day numbers row */}
          <div className="flex border-b border-border pb-2">
            {days.map((d) => (
              <div
                key={d}
                className="flex shrink-0 items-center justify-center"
                style={{ width: `${100 / totalDays}%` }}
              >
                {d === today ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {String(d).padStart(2, "0")}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {String(d).padStart(2, "0")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Today vertical line */}
          <div className="relative">
            <div
              className="absolute top-0 bottom-0 z-0 w-px bg-primary/20"
              style={{
                left: `${((today - 0.5) / totalDays) * 100}%`,
              }}
            />

            {/* Project rows */}
            <div className="relative z-10 flex flex-col gap-3 py-4">
              {PROJECTS.map((project) => {
                const leftPct = ((project.startDay - 1) / totalDays) * 100
                const widthPct = ((project.endDay - project.startDay + 1) / totalDays) * 100

                return (
                  <div key={project.id} className="relative h-14">
                    <div
                      className={cn(
                        "absolute flex h-14 items-center gap-2 rounded-xl px-3",
                        project.tag === "UX/UI"
                          ? "bg-[#0f3d47]"
                          : "bg-[#2a7a8a]"
                      )}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                    >
                      {/* Avatar */}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar text-[9px] font-bold text-sidebar-foreground ring-2 ring-white/20">
                        {project.avatar}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold text-white">
                            {project.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[10px] text-white/70">
                            {project.client}
                          </p>
                          <span className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-white",
                            project.tagColor
                          )}>
                            {project.tag}
                          </span>
                        </div>
                      </div>

                      {/* Progress / Done */}
                      {project.done ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                          {project.progress}%
                        </span>
                      )}
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
