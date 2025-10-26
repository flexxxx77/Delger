'use client';
import { useRef, useState } from 'react';

type Bucket = 'photos' | 'videos';

export default function UploadBox({
  onDone,
  bucket = 'photos',
}: { onDone: () => void; bucket?: Bucket }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);

  async function send(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));

    try {
      setBusy(true); setPct(10);
      const res = await fetch(`/api/media?bucket=${bucket}`, { method: 'POST', body: fd });

      // ---- Better error parse: try json -> text ----
      if (!res.ok) {
        let msg = 'Upload failed';
        try { const j = await res.json(); msg = j?.error || msg; }
        catch { msg = await res.text(); }
        alert(msg || 'Upload failed');
        return;
      }

      setPct(100);
      onDone();
      if (ref.current) ref.current.value = '';
    } finally {
      setBusy(false); setPct(null);
    }
  }

  return (
    <div
      className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
      onDragOver={(e)=>e.preventDefault()}
      onDrop={(e)=>{ e.preventDefault(); send(e.dataTransfer.files); }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <input ref={ref} type="file" multiple accept="image/*,video/*" hidden
               onChange={(e)=>send(e.target.files)} />
        <button
          onClick={()=>ref.current?.click()}
          disabled={busy}
          className="btn lg"
          style={{ height: 40 }}
        >
          {busy ? 'Uploading…' : 'Choose files'}
        </button>
        <span className="text-xs opacity-70">PNG, JPG, HEIC, GIF, MP4…</span>
      </div>

      {pct !== null && (
        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-white/60 transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
