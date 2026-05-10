import { cookies } from 'next/headers'

export async function getClientSession(): Promise<{ clientId: string; email: string; name: string; plan: string } | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('client_session')
    if (!cookie) return null
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString())
    if (!data.clientId) return null
    return data
  } catch {
    return null
  }
}
