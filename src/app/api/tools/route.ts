// app/api/tools/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL;
    const res = await fetch(`${backendUrl}/api/tools/getTools`);
    const tools = await res.json();
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error in proxy route:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}
