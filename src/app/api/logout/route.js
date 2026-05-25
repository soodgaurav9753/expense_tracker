// /app/api/logout/route.js
import { cookies } from 'next/headers';

export async function POST() {
  cookies().set('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return Response.json({ success: true, message: 'Logged out successfully' });
}
