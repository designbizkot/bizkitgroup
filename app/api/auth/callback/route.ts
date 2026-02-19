// import { NextResponse } from "next/server"
// import { createServerClient } from "@supabase/ssr"
// import { cookies } from "next/headers"

// export async function GET(req: Request) {
//   const cookieStore = await cookies()

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll: () => cookieStore.getAll(),
//         setAll: (cookiesToSet) => {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           )
//         },
//       },
//     }
//   )

//   const { searchParams } = new URL(req.url)
//   const code = searchParams.get("code")

//   if (code) {
//     await supabase.auth.exchangeCodeForSession(code)
//   }

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user?.email) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   const email = user.email.toLowerCase()

//   const { data: allowedUser } = await supabase
//     .from("users")
//     .select("id")
//     .eq("email", email)
//     .maybeSingle()

//   if (!allowedUser) {
//     await supabase.auth.signOut()
//     return NextResponse.redirect(new URL("/unauthorized", req.url))
//   }

//   return NextResponse.redirect(new URL("/", req.url))
// }
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name: string, options: any) => {
          cookieStore.set({
            name,
            value: "",
            path: "/", 
          })
        },
      },
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/`)
}
