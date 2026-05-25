import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../lib/db';
import { cookies } from 'next/headers';
import User from '../../../models/User'
import Feedback from '../../../models/feedback';

export async function POST(req) {
    const JWT_SECRET = process.env.JWT_SECRET;
  try {
    const { feedback } = await req.json();
    const token = cookies().get('token')?.value;
    
        if (!token) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
    
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        const email = user.email



    await connectDB();

    await Feedback.create({
      email,
      message: feedback,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
