// src/app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";


type Bucket = "photos" | "videos";

export default function Home() {
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState({ photos: 0, videos: 0 });
  const [busy, setBusy] = useState<Bucket | null>(null);

  // Counts-ийг API-гаас авна
  useEffect(() => {
    async function load() {
      const [ps, vs] = await Promise.all([
        fetch("/api/media?bucket=photos", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/media?bucket=videos", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setCounts({ photos: ps.length ?? 0, videos: vs.length ?? 0 });
    }
    load();
  }, []);

  async function upload(bucket: Bucket, files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));

    try {
      setBusy(bucket);
      const res = await fetch(`/api/media?bucket=${bucket}`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Upload failed");
        return;
      }
      // амжилттай бол тоолуураа шинэчилнэ
      const inc = (json.uploaded?.length as number) || 0;
      setCounts((c) => ({
        photos: c.photos + (bucket === "photos" ? inc : 0),
        videos: c.videos + (bucket === "videos" ? inc : 0),
      }));
    } finally {
      setBusy(null);
      if (bucket === "photos" && photoInput.current) photoInput.current.value = "";
      if (bucket === "videos" && videoInput.current) videoInput.current.value = "";
    }
  }

  return (
    <div className="wrapper bg-home">
      <div className="card">
        <div className="header">
          <div>
            <div className="h1">Memories</div>
            <div className="muted"></div>
          </div>
        </div>

        {/* Том, вертикал хоёр tile */}
        <div className="tiles">
          <Link href="/videos" className="tile primary" aria-label="Videos">
            <div className="icon">🎬</div>
            <div className="copy">
              <div className="title">Videos</div>
              <div className="sub">Upload • Watch • Save</div>
            </div>
            <div className="arrow">↗</div>
          </Link>

          <Link href="/photos" className="tile" aria-label="Photos">
            <div className="icon">🖼️</div>
            <div className="copy">
              <div className="title">Photos</div>
              <div className="sub">Upload • View • Save</div>
            </div>
            <div className="arrow">↗</div>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="quick">
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => upload("photos", e.target.files)}
          />
          <button
            className="btn lg"
            onClick={() => photoInput.current?.click()}
            disabled={busy !== null}
          >
            {busy === "photos" ? "Uploading photos…" : "Quick upload photos"}
          </button>

          <input
            ref={videoInput}
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => upload("videos", e.target.files)}
          />
          <button
            className="btn lg"
            onClick={() => videoInput.current?.click()}
            disabled={busy !== null}
          >
            {busy === "videos" ? "Uploading videos…" : "Quick upload videos"}
          </button>

          <span className="stat">📸 {counts.photos} photos</span>
          <span className="stat">🎞️ {counts.videos} videos</span>
        </div>
      </div>
    </div>
  );
}
