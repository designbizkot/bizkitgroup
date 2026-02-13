import { cookies } from "next/headers"

const SESSION_COOKIE = "bizkit_session"

export type SessionUser = {
  email: string
  name: string
  role: string
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (!session) return null

  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}