"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addMedia, deleteMedia, getAllMedia, MediaRecord } from "../../lib/db";

function formatBytes(n: number) {
  if (!n) return "0 B";
  const units = ["B","KB","MB","GB"]; let i=0; while(n>=1024 && i<units.length-1){ n/=1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

export default function PhotosPage() {
  const [items, setItems] = useState<(MediaRecord & { id: number; url: string })[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const recs = await getAllMedia("photos");
    const withUrls = recs.map((r) => ({ ...(r as Required<MediaRecord>), id: r.id!, url: URL.createObjectURL(r.file) }));
    setItems(prev => { prev.forEach(p=>URL.revokeObjectURL(p.url)); return withUrls; });
  }
  useEffect(() => { load(); return () => items.forEach(i=>URL.revokeObjectURL(i.url)); }, []);

  async function onPick(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) { if (f.type.startsWith("image")) await addMedia("photos", f); }
    await load(); if (inputRef.current) inputRef.current.value = "";
  }
  async function onDelete(id: number, url: string) {
    await deleteMedia("photos", id); URL.revokeObjectURL(url); await load();
  }

  return (
    <div className="wrapper bg-photos">
      <div className="card">
        <div className="header">
          <div className="h1">Photos</div>
          <Link className="back" href="/">← Буцах</Link>
        </div>

        <div className="upload">
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e)=>onPick(e.target.files)} />
          <button className="btn lg" onClick={()=>inputRef.current?.click()}>Upload photos</button>
          <span className="small">PNG, JPG, HEIC, GIF …</span>
        </div>

        <div className="grid">
          {items.map((p) => (
            <div className="item" key={p.id}>
              {/* FULL image, no crop */}
              <img className="thumb thumb--contain" src={p.url} alt={p.name} loading="lazy" />
              <div className="meta">
                <div className="name" title={p.name}>{p.name}</div>
                <div className="row">
                  <a className="btn" href={p.url} download={p.name}>Save</a>
                  <button className="btn danger" onClick={() => onDelete(p.id, p.url)}>Delete</button>
                </div>
              </div>
              <div className="meta small">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span>{formatBytes(p.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
