// app/api/me/route.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../lib/db';
import User from '../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET; // use env in production

export async function GET() {
  try {
    await connectDB();
    const token = cookies().get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
