import { NextResponse } from 'next/server';

// import { destroyAuthCookie } from '@/lib/auth';

// DELETE method 
export async function DELETE() {
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    response.cookies.set('token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
    });
    return response;
}
