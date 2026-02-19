import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function GET(req: Request) {
  const supabase = await createServerSupabase()

  const origin = new URL(req.url).origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      // Request readonly calendar scope so we can read the user's Google Calendar
      scopes: "https://www.googleapis.com/auth/calendar.readonly",
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.redirect(data.url)
}
