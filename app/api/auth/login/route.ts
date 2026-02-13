import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { email, password } = await request.json()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}