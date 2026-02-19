// import { createServerClient } from "@supabase/ssr"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl

//   if (
//     pathname.startsWith("/login") ||
//     pathname.startsWith("/auth") ||
//     pathname.startsWith("/unauthorized") ||
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api") ||
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next()
//   }

//   const res = NextResponse.next()

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll: () => req.cookies.getAll(),
//         setAll: (cookies) => {
//           cookies.forEach(({ name, value, options }) => {
//             res.cookies.set(name, value, options)
//           })
//         },
//       },
//     }
//   )

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   if (!user?.email) {
//     await supabase.auth.signOut()
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   const email = user.email.toLowerCase()


//   const { data: allowed } = await supabase
//     .from("users")
//     .select("id")
//     .eq("email", email)
//     .maybeSingle()

//   if (!allowed) {
//     await supabase.auth.signOut()
//     return NextResponse.redirect(
//       new URL("/unauthorized", req.url)
//     )
//   }

//   return res
// }

// export const config = {
//   matcher: ["/((?!login|auth|unauthorized|api|_next|favicon.ico).*)"],
// }

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🚨 อนุญาต route ที่ไม่ต้อง auth
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 🔥 สำคัญ: อ่านจาก request
        getAll: () => req.cookies.getAll(),

        // 🔥 สำคัญ: set ลง response
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!login|auth|unauthorized|api|_next|favicon.ico).*)"],
}
