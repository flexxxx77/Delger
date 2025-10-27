import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Bucket = 'photos' | 'videos';

const ALLOWED = [
  'image/png','image/jpeg','image/webp','image/gif',
  'image/heic','image/heif','image/heic-sequence','image/heif-sequence',
  'video/mp4','video/quicktime','video/3gpp'
];

function pickBucket(req: NextRequest): Bucket {
  const q = (req.nextUrl.searchParams.get('bucket') ?? 'photos').toLowerCase();
  return q === 'videos' ? 'videos' : 'photos';
}

/** MIME type-ийг өргөтгөлөөс таамаглах */
function guessType(pathname: string): string {
  const ext = (pathname.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'heic': return 'image/heic';
    case 'heif': return 'image/heif';
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case '3gp':
    case '3gpp': return 'video/3gpp';
    default: return 'application/octet-stream';
  }
}

type Item = {
  url: string;
  type: string;
  size: number;
  name: string;
  uploadedAtMs: number;   // ⬅️ тоон timestamp болгож авна
  pathname: string;
};

export async function GET(req: NextRequest) {
  try {
    const bucket = pickBucket(req);
    const res = await list({ prefix: `${bucket}/` });

    // ⬇️ ЭНЭ хэсэг л таны screenshot дээрх map(...) хэсэг
    const items: Item[] = res.blobs.map(b => ({
      url: b.url,
      type: guessType(b.pathname),
      size: b.size,
      name: b.pathname.split('/').at(-1) ?? b.pathname,
      uploadedAtMs: b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0,
      pathname: b.pathname,
    }));

    // Шинээр орсныг эхэнд нь харуулах
    items.sort((a, b) => b.uploadedAtMs - a.uploadedAtMs);

    return NextResponse.json(items);
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

    const out: Array<{ url: string }> = [];
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) {
        return NextResponse.json({ error: `Unsupported type: ${f.type}` }, { status: 400 });
      }
      if (f.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large' }, { status: 400 });
      }
      const safe = (f.name || 'file').replace(/\s+/g, '_');
      const key = `${bucket}/${Date.now()}-${safe}`;
      const { url } = await put(key, f, { access: 'public' });
      out.push({ url });
    }
    return NextResponse.json({ uploaded: out }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/media failed:', e);
    return new NextResponse(e?.message || 'Upload failed', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json().catch(() => ({}));
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('DELETE /api/media failed:', e);
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 });
  }
}
