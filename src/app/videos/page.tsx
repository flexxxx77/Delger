"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addMedia, deleteMedia, getAllMedia, MediaRecord } from "../../lib/db";

function formatBytes(n: number) {
  if (!n) return "0 B";
  const units = ["B","KB","MB","GB"]; let i=0; while(n>=1024 && i<units.length-1){ n/=1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

export default function VideosPage() {
  const [items, setItems] = useState<(MediaRecord & { id: number; url: string })[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const recs = await getAllMedia("videos");
    const withUrls = recs.map((r) => ({ ...(r as Required<MediaRecord>), id: r.id!, url: URL.createObjectURL(r.file) }));
    setItems(prev => { prev.forEach(p=>URL.revokeObjectURL(p.url)); return withUrls; });
  }

  useEffect(() => { load(); return () => items.forEach(i=>URL.revokeObjectURL(i.url)); }, []);

  async function onPick(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) { if (f.type.startsWith("video")) await addMedia("videos", f); }
    await load(); if (inputRef.current) inputRef.current.value = "";
  }
  async function onDelete(id: number, url: string) {
    await deleteMedia("videos", id); URL.revokeObjectURL(url); await load();
  }

  return (
    <div className="wrapper bg-videos">
      <div className="card">
        <div className="header">
          <div className="h1">Videos</div>
          <Link className="back" href="/">← Буцах</Link>
        </div>

        <div className="upload">
          <input ref={inputRef} type="file" accept="video/*" multiple onChange={(e)=>onPick(e.target.files)} />
          <button className="btn lg" onClick={()=>inputRef.current?.click()}>Upload videos</button>
          <span className="small">MP4, MOV, WEBM …</span>
        </div>

        <div className="grid">
          {items.map((v) => (
            <div className="item" key={v.id}>
              <video className="thumb" src={v.url} controls preload="metadata" playsInline />
              <div className="meta">
                <div className="name" title={v.name}>{v.name}</div>
                <div className="row">
                  <a className="btn" href={v.url} download={v.name}>Save</a>
                  <button className="btn danger" onClick={() => onDelete(v.id, v.url)}>Delete</button>
                </div>
              </div>
              <div className="meta small">
                <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                <span>{formatBytes(v.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
