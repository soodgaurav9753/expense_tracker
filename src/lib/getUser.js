// /lib/getUser.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '../models/User';

export async function getUserFromToken(req) {
    const secret = 'sss'
  const token = cookies().get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token,secret);
    const user = await User.findById(decoded.id);
    return user;
  } catch {
    return null;
  }
}
