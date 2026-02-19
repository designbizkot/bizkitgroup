"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  dayOfWeek: string
  day: string
  month: string
  year: string
  time: string
  title: string
  tag: string
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [synced, setSynced] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [connectUrl, setConnectUrl] = useState<string | null>(null)

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch("/api/calendar/events")
      const data = await res.json()

      setEvents(data.events || [])
      setSynced(data.synced || false)
      setConnectUrl(data.connectUrl || null)
    } catch {
      setEvents([])
      setSynced(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/upcoming")
      if (!res.ok) {
        setUserEmail(null)
        return
      }
      const data = await res.json()
      setUserEmail(data.user?.email || null)
    } catch {
      setUserEmail(null)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    fetchUser()
  }, [fetchEvents, fetchUser])

  const tagColorMap: Record<string, string> = {
    Social: "bg-primary text-primary-foreground",
    Meeting: "bg-[#458897] text-white",
    Deadline: "bg-[#c0392b] text-white",
    Workshop: "bg-[#0f5463] text-white",
    Event: "bg-[#73a6b1] text-white",
  }

  return (
    <section className="rounded-xl bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          Upcoming events
        </h2>

        <button
          onClick={() => fetchEvents(true)}
          disabled={refreshing}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-card-foreground disabled:opacity-50"
          aria-label="Refresh calendar"
        >
          <RefreshCw
            size={16}
            className={cn(refreshing && "animate-spin")}
          />
        </button>
      </div>

      {/* Email */}
      <div className="mt-1">
        <p className="text-xs text-muted-foreground">
          {userEmail || "Not logged in"}
        </p>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          /* ✨ Clean Empty State (No Gray Background) */
          <div className="py-6 text-center">
            <p className="text-base font-semibold text-card-foreground">
              No upcoming events
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Create an event to keep your schedule aligned.
            </p>

            {!synced && connectUrl && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => (window.location.href = connectUrl)}
                  className="mt-2 rounded-md bg-[#1F6F78] px-5 py-2 text-white flex items-center gap-2"
                >
                  + Sync with a calendar
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Events */
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg bg-[#D0E1E5] p-3"
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center rounded-lg bg-[#e8f0f2] px-3 py-2 text-center">
                    <span className="text-[10px] font-medium text-primary">
                      {event.dayOfWeek}
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {event.day}
                    </span>
                    <span className="text-[10px] font-medium text-primary">
                      {event.month}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {event.time}
                    </p>

                    <p className="text-sm font-semibold text-card-foreground">
                      {event.title}
                    </p>

                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold",
                        tagColorMap[event.tag] || tagColorMap.Event
                      )}
                    >
                      {event.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
