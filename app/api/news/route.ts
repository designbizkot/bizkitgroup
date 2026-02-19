import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

//
// GET → ดึงข่าวของ user ที่ login อยู่
//
export async function GET() {
  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

//
// POST → เพิ่มข่าว
//
export async function POST(req: Request) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(url)
    const html = await res.text()

    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/)
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    const siteMatch = html.match(/<meta property="og:site_name" content="(.*?)"/)

    const title = titleMatch?.[1] || "No title"
    const image = imageMatch?.[1] || ""
    const source = siteMatch?.[1] || new URL(url).hostname

    const { data, error } = await supabase
      .from("news")
      .insert({
        url,
        title,
        image,
        source,
        date: new Date().toLocaleDateString(),
        user_id: user.id, // ⭐ สำคัญมาก
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    )
  }
}

//
// PUT → แก้ไขข่าว
//
export async function PUT(req: Request) {
  const { id, title, image, source, date } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("news")
    .update({ title, image, source, date })
    .eq("id", id)
    .eq("user_id", user.id) // ⭐ ป้องกันแก้ของคนอื่น
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

//
// DELETE → ลบข่าว
//
export async function DELETE(req: Request) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("news")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id) // ⭐ ป้องกันลบของคนอื่น

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
