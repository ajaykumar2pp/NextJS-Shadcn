import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const trimmedEmail = email.trim().toLowerCase();

    // check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    // Generate JWT token
    const token = createToken({ id: user.id, email: user.email });

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 });
  }
}
