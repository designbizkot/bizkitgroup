import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

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

  let userAccessToken: string | null = null

  try {
    const supabase = await createServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const s: any = session
    userAccessToken = s?.provider_token || s?.provider_access_token || null
  } catch (e) {
    console.warn("Supabase session check failed", e)
  }

  // ❌ No API key and no OAuth token
  if (!apiKey && !userAccessToken) {
    return NextResponse.json({
      synced: false,
      events: [],
      connectUrl: "/api/auth/google",
    })
  }

  try {
    const now = new Date()
    const timeMin = now.toISOString()
    const maxDate = new Date(now)
    maxDate.setDate(maxDate.getDate() + 30)
    const timeMax = maxDate.toISOString()

    const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events`

    const url = new URL(baseUrl)
    url.searchParams.set("timeMin", timeMin)
    url.searchParams.set("timeMax", timeMax)
    url.searchParams.set("singleEvents", "true")
    url.searchParams.set("orderBy", "startTime")
    url.searchParams.set("maxResults", "10")

    const fetchOpts: RequestInit = {
      next: { revalidate: 300 } as any,
    }

    if (userAccessToken) {
      ;(fetchOpts as any).headers = {
        Authorization: `Bearer ${userAccessToken}`,
      }
    } else if (apiKey) {
      url.searchParams.set("key", apiKey)
    }

    const res = await fetch(url.toString(), fetchOpts)

    if (!res.ok) {
      console.error("Google Calendar API error:", res.status)
      return NextResponse.json({
        synced: false,
        events: [],
        connectUrl: "/api/auth/google",
      })
    }

    const data = await res.json()

    const events = (data.items || []).map((item: GoogleCalendarEvent) => {
      const startStr = item.start.dateTime || item.start.date || ""
      const endStr = item.end.dateTime || item.end.date || ""
      const startDate = new Date(startStr)
      const endDate = new Date(endStr)

      const dayOfWeek = startDate.toLocaleDateString("en-US", {
        weekday: "short",
      })

      const day = String(startDate.getDate()).padStart(2, "0")

      const month = startDate.toLocaleDateString("en-US", {
        month: "short",
      })

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
      synced: !!userAccessToken,
      events,
      connectUrl: !userAccessToken ? "/api/auth/google" : null,
    })
  } catch (error) {
    console.error("Calendar fetch error:", error)

    return NextResponse.json({
      synced: false,
      events: [],
      connectUrl: "/api/auth/google",
    })
  }
}
