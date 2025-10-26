'use client';
import { useCallback, useEffect, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import { MediaCard } from '@/components/MediaCard';

type Rec = { id:number; url:string; type:string; name:string; size:number; createdAt:string };

export default function PhotosPage() {
  const [items, setItems] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/media?bucket=photos', { cache: 'no-store' });
    setItems(await r.json());
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); }, [load]);
  const onDelete = (id:number) => setItems(p=>p.filter(x=>x.id!==id));

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Photos</h1>
          <p>Upload • View • Save</p>
        </div>
      </div>

      <UploadBox bucket="photos" onDone={load} />

      {loading && <div className="skeleton-grid"><div/><div/><div/><div/></div>}
      {!loading && items.length===0 && (
        <div className="empty">
          <span>🖼️</span>
          <p>No photos yet. Upload above.</p>
        </div>
      )}

      <div className="pro-grid">
        {items.map(r => <MediaCard key={r.id} rec={r} onDelete={onDelete} />)}
      </div>
    </div>
  );
}
