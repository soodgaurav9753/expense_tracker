import { NextResponse } from 'next/server';
import {connectDB} from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET; // move to env in production

export async function GET() {
  try {
    await connectDB();

    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const yearlyMap = {};

    user.expenses.forEach((exp) => {
      const year = new Date(exp.date).getFullYear();
      yearlyMap[year] = (yearlyMap[year] || 0) + exp.amount;
    });

    const result = Object.entries(yearlyMap).map(([year, amount]) => ({
      year,
      amount,
    })).sort((a, b) => a.year - b.year);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
