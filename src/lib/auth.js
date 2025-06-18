import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';


// Create a JWT Token
export function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Set JWT Cookie
export function setAuthCookie(token) {
  const cookieStore = cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    path: '/',
    secure: false,
    maxAge: 60 * 60 * 24 * 7, 
  });
}

// Read JWT Cookie (on server)
export function getToken() {
    const token = cookies().get('token')?.value;
  return token || null;
}

// Decode token and get user payload
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return jwt.verify(token,  process.env.JWT_SECRET);
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
}

// Destroy cookie (logout)
export function destroyAuthCookie() {
  cookies().set('token', '', {
    httpOnly:true,
    path: '/',
    maxAge: 0,
  });
}
