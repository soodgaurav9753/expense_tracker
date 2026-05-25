// /app/api/change-password/route.js
import {connectDB} from '../../../lib/db';
import User from '../../../models/User';
import { compare, hash } from 'bcryptjs';
import { getUserFromToken } from '../../../lib/getUser';

export async function PATCH(req) {
  await connectDB();
  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return Response.json({ error: 'Both old and new passwords are required' }, { status: 400 });
  }

  const user = await getUserFromToken(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await User.findById(user._id);
  const isMatch = await compare(oldPassword, dbUser.password);
  if (!isMatch) return Response.json({ error: 'Old password is incorrect' }, { status: 403 });

  dbUser.password = await hash(newPassword, 10);
  await dbUser.save();

  return Response.json({ success: true, message: 'Password updated successfully' });
}
