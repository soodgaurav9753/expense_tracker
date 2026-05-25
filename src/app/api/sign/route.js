
import { connectDB } from '../../../lib/db';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET ;

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { name, email, password, monthlyEarning, occupation } = body;

  if (!name || !email || !password || !monthlyEarning || !occupation) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const defaultCategories = ['Food', 'Rent', 'Groceries', 'Travel'];

  const newUser = new User({
    name,
    email,
    password: hashed,
    monthlyEarning,
    occupation,
    categories: defaultCategories,
    expenses: [],
  });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
  cookies().set('token', token, { httpOnly: true, secure: false, path: '/' });

  return NextResponse.json({ message: 'User created successfully' });
}
