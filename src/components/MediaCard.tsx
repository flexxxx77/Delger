// src/components/MediaCard.tsx
"use client";
import { useState } from "react";

type Rec = {
  url: string;
  type: string;
  name: string;
  size: number;
  uploadedAt: string | null;
  pathname: string;
};

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

export default function MediaCard({
  item,
  bucket,
  onDelete,
}: {
  item: Rec;
  bucket: "photos" | "videos";
  onDelete: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Delete this file?")) return;
    try {
      setBusy(true);
      const id = encodeURIComponent(item.pathname);
      const r = await fetch(`/api/media/${id}?bucket=${bucket}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      onDelete(item.url);
    } catch (e) {
      alert("Delete failed");
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  const isImage = item.type.startsWith("image/");
  const isVideo = item.type.startsWith("video/");

  return (
    <div className="mc">
      <div className="mc-media">
        {isImage && <img src={item.url} alt={item.name} />}
        {isVideo && <video src={item.url} controls playsInline preload="metadata" />}
      </div>

      <div className="mc-info">
        <div className="mc-title" title={item.name}>{item.name}</div>
        <div className="mc-sub">
          <span>{fmtBytes(item.size)}</span><span>•</span>
          <span>{item.type}</span>
          {item.uploadedAt && (<><span>•</span><span>{new Date(item.uploadedAt).toLocaleString()}</span></>)}
        </div>
      </div>

      <div className="mc-actions">
        <a className="btn ghost" href={item.url} target="_blank" rel="noreferrer">Open</a>
        <button className="btn danger" onClick={remove} disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
