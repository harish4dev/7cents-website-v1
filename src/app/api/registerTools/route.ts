// src/app/api/registerTools/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // adjust path if needed
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const backendUrl = process.env.BACKEND_URL;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { toolIds } = body;

  if (!Array.isArray(toolIds) || toolIds.length === 0) {
    return NextResponse.json({ error: 'No toolIds provided' }, { status: 400 });
  }

  try {
    const response = await axios.post(`${backendUrl}/api/user/registerTools`, {
      userId: session.user.id,
      toolIds,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Register tools error:', error);
    return NextResponse.json({ error: 'Failed to register tools' }, { status: 500 });
  }
}
