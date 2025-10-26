import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
  return NextResponse.json({ hasToken: !!process.env.BLOB_READ_WRITE_TOKEN });
}
