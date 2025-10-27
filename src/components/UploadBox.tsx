'use client';

import { useCallback, useRef, useState } from 'react';

type Bucket = 'photos' | 'videos';

type Props = {
  bucket: Bucket;
  onDone?: () => void; // дуусмагц дахин ачаалгах эсвэл листээ сэргээхэд хэрэглэ
};

const ACCEPT =
  'image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,image/heif-sequence,image/heic-sequence,video/mp4,video/quicktime,video/3gpp';

export default function UploadBox({ bucket, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files || !('length' in files) || files.length === 0) return;

      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));

      try {
        setBusy(true);
        setMsg('Uploading...');
        const res = await fetch(`/api/media?bucket=${bucket}`, {
          method: 'POST',
          body: form,
        });

        if (!res.ok) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error || `Upload failed (${res.status})`);
        }

        setMsg('Uploaded ✓');
        onDone?.();
      } catch (e: any) {
        console.error('upload failed', e);
        alert(e?.message || 'Upload failed');
      } finally {
        setBusy(false);
        setTimeout(() => setMsg(null), 1000);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [bucket, onDone]
  );

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  // drag & drop
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      className={`uploader ${isDragging ? 'is-drag' : ''} ${busy ? 'is-busy' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      aria-busy={busy}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={onInput}
      />

      <button className="btn" type="button" onClick={pick} disabled={busy}>
        Choose files
      </button>

      <span className="hint">
        PNG, JPG, HEIC, GIF, MP4, MOV …
      </span>

      {msg && <span className="status">{msg}</span>}

      <style jsx>{`
        .uploader {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          transition: 0.2s ease;
        }
        .uploader.is-drag {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.06);
        }
        .uploader.is-busy {
          opacity: 0.7;
          pointer-events: none;
        }
        .btn {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          cursor: pointer;
          font-weight: 600;
        }
        .btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .hint {
          font-size: 12px;
          opacity: 0.7;
        }
        .status {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
