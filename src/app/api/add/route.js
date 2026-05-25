import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import {connectDB} from '../../../lib/db';
import User from '../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    console.log(userId)

    const { title, amount, category, date } = await req.json();

    if (!title || !amount || !category || !date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    console.log(user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newExpense = { title, amount, category, date };

    user.expenses.push(newExpense);
    await user.save();

    return NextResponse.json({ message: 'Expense added successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
