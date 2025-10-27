// src/app/videos/page.tsx
'use client';
import { useCallback, useEffect, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import MediaCard from '@/components/MediaCard';

type Rec = {
  url: string;
  type: string;
  name: string;
  size: number;
  uploadedAt: string | null;
  pathname: string;
};

export default function VideosPage() {
  const [items, setItems] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch('/api/media?bucket=videos', { cache: 'no-store' });
      const data = (await r.json()) as Rec[];
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div><h1>Videos</h1><p>Upload • Watch • Save</p></div>
      </div>

      <UploadBox bucket="videos" onDone={load} />

      {loading && <p className="empty">Loading...</p>}
      {!loading && items.length === 0 && (
        <div className="empty"><p>No videos yet.</p><p className="text-xs">Upload some videos above.</p></div>
      )}

      <div className="grid">
        {items.map(it => (
          <MediaCard key={it.url} item={it} bucket="videos"
            onDelete={(url: string) => setItems(prev => prev.filter(x => x.url !== url))} />
        ))}
      </div>
    </div>
  );
}
