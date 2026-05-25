import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {connectDB} from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // must match signup/login

// 🔐 Extract user ID from JWT token
function getUserIdFromToken() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await connectDB();
    const userId = getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const grouped = {};

    for (const exp of user.expenses) {
      const year = new Date(exp.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(exp);
    }

    return NextResponse.json({ expensesByYear: grouped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const userId = getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { date, title, amount } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete matching expense
    user.expenses = user.expenses.filter(
      (exp) =>
        !(
          exp.date === date &&
          exp.title === title &&
          exp.amount === amount
        )
    );

    await user.save();
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
