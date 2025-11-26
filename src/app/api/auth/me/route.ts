import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No token found' }),
        { status: 401 }
      );
    }

    // Verify token with backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${backendUrl}/client-auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Token verification failed' }),
        { status: 401 }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
