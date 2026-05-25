// app/api/send-otp/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {connectDB} from '../../../lib/db';
import Otp from '../../../models/otp';

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store or update OTP in DB
  await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP for password reset is: <b>${otp}</b><br/>Valid for 5 minutes.</p>`,
  });

  return NextResponse.json({ message: 'OTP sent successfully' });
}
