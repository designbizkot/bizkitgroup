import { NextResponse } from "next/server"

interface GoogleCalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  description?: string
  location?: string
  colorId?: string
}

export async function GET() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary"

  // If no API key is configured, return demo events
  if (!apiKey) {
    return NextResponse.json({
      synced: false,
      events: getDemoEvents(),
    })
  }

  try {
    const now = new Date()
    const timeMin = now.toISOString()
    const maxDate = new Date(now)
    maxDate.setDate(maxDate.getDate() + 30)
    const timeMax = maxDate.toISOString()

    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    )
    url.searchParams.set("key", apiKey)
    url.searchParams.set("timeMin", timeMin)
    url.searchParams.set("timeMax", timeMax)
    url.searchParams.set("singleEvents", "true")
    url.searchParams.set("orderBy", "startTime")
    url.searchParams.set("maxResults", "10")

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // cache for 5 minutes
    })

    if (!res.ok) {
      console.error("Google Calendar API error:", res.status, await res.text())
      return NextResponse.json({
        synced: false,
        events: getDemoEvents(),
        error: "Failed to fetch calendar events",
      })
    }

    const data = await res.json()
    const events = (data.items || []).map((item: GoogleCalendarEvent) => {
      const startStr = item.start.dateTime || item.start.date || ""
      const endStr = item.end.dateTime || item.end.date || ""
      const startDate = new Date(startStr)
      const endDate = new Date(endStr)

      const dayOfWeek = startDate.toLocaleDateString("en-US", { weekday: "short" })
      const day = String(startDate.getDate()).padStart(2, "0")
      const month = startDate.toLocaleDateString("en-US", { month: "short" })
      const year = String(startDate.getFullYear())

      let time = "All Day"
      if (item.start.dateTime) {
        const startTime = startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        const endTime = endDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        time = `${startTime} - ${endTime}`
      }

      // Determine tag from description or default
      let tag = "Event"
      const desc = (item.description || "").toLowerCase()
      if (desc.includes("social")) tag = "Social"
      else if (desc.includes("meeting")) tag = "Meeting"
      else if (desc.includes("deadline")) tag = "Deadline"
      else if (desc.includes("workshop")) tag = "Workshop"

      return {
        id: item.id,
        dayOfWeek,
        day,
        month,
        year,
        time,
        title: item.summary || "Untitled Event",
        tag,
      }
    })

    return NextResponse.json({
      synced: true,
      events,
    })
  } catch (error) {
    console.error("Calendar fetch error:", error)
    return NextResponse.json({
      synced: false,
      events: getDemoEvents(),
      error: "Failed to connect to Google Calendar",
    })
  }
}

function getDemoEvents() {
  return [
    {
      id: "demo-1",
      dayOfWeek: "Wed",
      day: "04",
      month: "Feb",
      year: "2026",
      time: "4:00 PM - 6:00 PM",
      title: "Bizkit Introduction Event",
      tag: "Social",
    },
  ]
}
