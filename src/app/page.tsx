"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addMedia, getAllMedia } from "../lib/db";

export default function Home() {
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState({ photos: 0, videos: 0 });

  useEffect(() => {
    async function load() {
      const [ps, vs] = await Promise.all([getAllMedia("photos"), getAllMedia("videos")]);
      setCounts({ photos: ps.length, videos: vs.length });
    }
    load();
  }, []);

  async function pick(type: "photos" | "videos", files: FileList | null) {
    if (!files) return;
    const list = Array.from(files);
    for (const f of list) {
      if (type === "photos" && f.type.startsWith("image")) await addMedia("photos", f);
      if (type === "videos" && f.type.startsWith("video")) await addMedia("videos", f);
    }
    setCounts(c => ({
      photos: c.photos + (type === "photos" ? list.filter(f=>f.type.startsWith("image")).length : 0),
      videos: c.videos + (type === "videos" ? list.filter(f=>f.type.startsWith("video")).length : 0),
    }));
    if (type === "photos" && photoInput.current) photoInput.current.value = "";
    if (type === "videos" && videoInput.current) videoInput.current.value = "";
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
          <input ref={photoInput} type="file" accept="image/*" multiple onChange={e=>pick("photos", e.target.files)} />
          <button className="btn lg" onClick={()=>photoInput.current?.click()}>Quick upload photos</button>

          <input ref={videoInput} type="file" accept="video/*" multiple onChange={e=>pick("videos", e.target.files)} />
          <button className="btn lg" onClick={()=>videoInput.current?.click()}>Quick upload videos</button>

          <span className="stat">📸 {counts.photos} photos</span>
          <span className="stat">🎞️ {counts.videos} videos</span>
        </div>
      </div>
    </div>
  );
}
