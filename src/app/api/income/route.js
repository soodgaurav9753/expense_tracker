import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {connectDB} from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // same as used in your signup/login

export async function PATCH(req) {
  try {
    await connectDB();

    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decoded.id;

    const { add } = await req.json();
    if (!add || isNaN(add)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.monthlyEarning += Number(add);
    await user.save();

    return NextResponse.json({ success: true, newIncome: user.monthlyEarning });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
