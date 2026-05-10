import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
  } catch {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
}
