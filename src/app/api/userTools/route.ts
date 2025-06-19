import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // adjust path as needed
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const backendUrl = process.env.BACKEND_URL;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Forward request to backend API to fetch user tools
    const response = await axios.get(`${backendUrl}/api/user/userTools?userId=${session.user.id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Fetch user tools error:', error);
    return NextResponse.json({ error: 'Failed to fetch user tools' }, { status: 500 });
  }
}
