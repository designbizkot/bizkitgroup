"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Lead {
  id: string
  name: string
  company: string
  status: string
}

interface Props {
  leads: Lead[]
  onStatusChange: (id: string, newStatus: string) => void
  statuses: string[]
}

export function SalesKanban({ leads, onStatusChange, statuses }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDrop = (status: string) => {
    if (!draggedId) return
    onStatusChange(draggedId, status)
    setDraggedId(null)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {statuses.map((status) => {
        const columnLeads = leads.filter((l) => l.status === status)

        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status)}
            className="w-72 flex-shrink-0 rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-sm"
          >
            <h3 className="mb-4 flex items-center justify-between text-sm font-semibold text-foreground">
              <span>{status}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {columnLeads.length}
              </span>
            </h3>

            <div className="space-y-3 min-h-[320px]">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDraggedId(lead.id)}
                  className={cn(
                    "cursor-grab rounded-xl border border-border/60 bg-card p-4 text-sm shadow-sm transition hover:shadow-md active:cursor-grabbing"
                  )}
                >
                  <p className="font-semibold text-foreground">
                    {lead.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lead.company}
                  </p>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
