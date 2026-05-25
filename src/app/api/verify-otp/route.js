// app/api/verify-otp/route.js
import { NextResponse } from 'next/server';
import Otp from '../../../models/otp';
import {connectDB} from '../../../lib/db';

export async function POST(req) {
  await connectDB();
  const { otp, otpHash } = await req.json();

  const record = await Otp.findOne({ otp: otpHash });

  if (!record || record.otp !== otp) {
    return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
  }

  await Otp.deleteOne({ otp: otpHash });

  return NextResponse.json({ message: 'OTP verified successfully' });
}
