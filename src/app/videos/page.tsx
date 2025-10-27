'use client';
import { useCallback, useEffect, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import { MediaCard } from '@/components/MediaCard';

type Rec = { url:string; type:string; name:string; size:number; uploadedAt:string|null; pathname:string };

export default function VideosPage() {
  const [items, setItems] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async ()=>{
    setLoading(true);
    const r = await fetch('/api/media?bucket=videos', { cache:'no-store' });
    setItems(await r.json());
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); }, [load]);
  const onDelete = (url:string) => setItems(p=>p.filter(x=>x.url !== url));

  return (
    <div className="page-wrap">
      <div className="page-header"><div><h1>Videos</h1><p>Upload • Watch • Save</p></div></div>
      <UploadBox bucket="videos" onDone={load} />
      {loading && <div className="skeleton-grid"><div/><div/><div/><div/></div>}
      {!loading && items.length===0 && <div className="empty"><span>🎬</span><p>No videos yet.</p></div>}
      <div className="pro-grid">{items.map(r => <MediaCard key={r.url} rec={r} onDelete={onDelete} />)}</div>
    </div>
  );
}
