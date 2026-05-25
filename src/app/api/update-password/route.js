// app/api/change-password/route.js
import { NextResponse } from 'next/server';
import {connectDB} from '../../../lib/db';
import User from '../../../models/User';
import { hash } from 'bcryptjs';

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and new password are required' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const hashedPassword = await hash(password, 12);
  user.password = hashedPassword;
  await user.save();

  return NextResponse.json({ message: 'Password changed successfully' });
}
