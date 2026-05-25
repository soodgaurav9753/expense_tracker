import {connectDB } from '../../../lib/db';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET; // same as in signup route

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
   

    const user = await User.findOne({ email });
     console.log(user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    cookies().set('token', token, {
      httpOnly: true,
      secure: false,
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
