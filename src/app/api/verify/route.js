// app/api/verify-otp/route.js
import { NextResponse } from 'next/server';
import {connectDB} from '../../../lib/db';
import Otp from '../../../models/otp';

export async function POST(req) {
  await connectDB();
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
  }

  const record = await Otp.findOne({ email });
  if (!record) {
    return NextResponse.json({ message: 'No OTP found for this email' }, { status: 400 });
  }

  const now = Date.now();
  const isExpired = now - record.createdAt > 5 * 60 * 1000; // 5 minutes

  if (isExpired) {
    await Otp.deleteOne({ email });
    return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
  }

  if (record.otp !== otp) {
    return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }

  await Otp.deleteOne({ email }); // OTP used, remove it
  return NextResponse.json({ message: 'OTP verified successfully' });
}
