"use server";

import Cookies from 'js-cookie';

export function setAuthToken(token: string) {
  Cookies.set('token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: 7, // 7 days
  });
}
