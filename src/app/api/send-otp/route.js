// app/api/send-otp/route.js
import { NextResponse } from 'next/server';
import Otp from '../../../models/otp';
import {connectDB} from '../../../lib/db';
import nodemailer from 'nodemailer';

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Verify Email" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<h1>Your OTP: ${otp}</h1><p>Valid for 5 minutes.</p>`,
  });

  // Save OTP to DB
  await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true });

  return NextResponse.json({ message: 'OTP sent successfully', otpHash: otp });
}
