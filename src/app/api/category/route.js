import { NextResponse } from 'next/server'
import {connectDB} from '../../../lib/db'
import User from '../../../models/User'
import jwt from 'jsonwebtoken'



function getUserFromCookie(req) {
    const secret = process.env.JWT_SECRET
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null

  const token = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('token='))

  if (!token) return null

  const jwtToken = token.split('=')[1]
  try {
    const decoded = jwt.verify(jwtToken, secret)
    return decoded.id // Make sure you're signing token with { id: user._id }
  } catch (err) {
    return null
  }
}

export async function GET(req) {
  await connectDB()
  const userId = getUserFromCookie(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await User.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ categories: user.categories || [] })
}

export async function POST(req) {
  await connectDB()
  const userId = getUserFromCookie(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name || name.trim() === '') {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  }

  const user = await User.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.categories.includes(name)) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
  }

  user.categories.push(name)
  await user.save()

  return NextResponse.json({ success: true })
}

export async function DELETE(req) {
  await connectDB()
  const userId = getUserFromCookie(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name || name.trim() === '') {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  }

  const user = await User.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  user.categories = user.categories.filter(cat => cat !== name)
  await user.save()

  return NextResponse.json({ success: true })
}
