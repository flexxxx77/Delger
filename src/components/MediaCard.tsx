'use client';
import { useState } from 'react';
import Image from 'next/image';

type Rec = { id:number; url:string; type:string; name:string };

export function MediaCard({ rec, onDelete }: { rec: Rec; onDelete:(id:number)=>void }) {
  const isVideo = rec.type.startsWith('video/');
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pro-card group" onClick={() => setOpen(true)}>
        {/* fancy gradient border */}
        <div className="pro-card-border" />
        <div className="pro-card-inner">
          <div className="pro-media">
            {isVideo ? (
              <video src={rec.url} className="pro-media-el" muted playsInline />
            ) : (
              <Image
                src={rec.url}
                alt={rec.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="pro-media-el object-cover"
                priority={false}
              />
            )}
          </div>

          {/* hover overlay */}
          <div className="pro-overlay">
            <span className="pro-chip">{isVideo ? 'Video' : 'Photo'}</span>
            <span className="pro-open">View</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div className="pro-lightbox" onClick={() => setOpen(false)}>
          <div className="pro-lightbox-body" onClick={(e)=>e.stopPropagation()}>
            <div className="pro-lightbox-actions">
              <a className="btn" href={rec.url} download>Save</a>
              <button
                className="btn danger"
                onClick={async ()=>{
                  if (!confirm('Delete this item?')) return;
                  await fetch(`/api/media/${rec.id}`, { method:'DELETE' });
                  onDelete(rec.id);
                  setOpen(false);
                }}
              >Delete</button>
              <button className="btn" onClick={()=>setOpen(false)}>Close</button>
            </div>

            {isVideo ? (
              <video src={rec.url} controls className="pro-lightbox-media" />
            ) : (
              <Image
                src={rec.url}
                alt={rec.name}
                width={1600}
                height={1200}
                className="pro-lightbox-media"
                sizes="100vw"
                priority
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
