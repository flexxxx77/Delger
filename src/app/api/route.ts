import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { addMedia, getAllMedia } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = [
  'image/png','image/jpeg','image/webp','image/gif',
  'image/heic','image/heif','image/heic-sequence','image/heif-sequence',
  'video/mp4','video/quicktime','video/3gpp'
];

function pickBucket(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('bucket') ?? 'photos').toLowerCase();
  return q === 'videos' ? 'videos' : 'photos';
}

export async function GET(req: NextRequest) {
  try {
    const bucket = pickBucket(req);
    const recs = await getAllMedia(bucket as any);
    return NextResponse.json(recs);
  } catch (e: any) {
    console.error('GET /api/media failed:', e);
    return NextResponse.json({ error: e?.message || 'GET failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const bucket = pickBucket(req);
    const form = await req.formData();
    const files = form.getAll('files') as File[];

    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

    const out: any[] = [];
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) {
        return NextResponse.json({ error: `Unsupported type: ${f.type}` }, { status: 400 });
      }
      if (f.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large' }, { status: 400 });
      }

      const safe = f.name.replace(/\s+/g, '_');
      const { url } = await put(`${bucket}/${Date.now()}-${safe}`, f, { access: 'public' });
      const rec = await addMedia(bucket as any, { url, type: f.type, size: f.size, name: f.name });
      out.push(rec);
    }
    return NextResponse.json({ uploaded: out }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/media failed:', e);
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
