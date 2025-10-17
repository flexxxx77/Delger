export type StoreName = "videos" | "photos";

export type MediaRecord = {
  id?: number;
  name: string;
  type: string;
  size: number;
  file: File; // File/Blob хадгална
  createdAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("memories", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addMedia(store: StoreName, file: File): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const id = tx.objectStore(store).add({
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      createdAt: Date.now(),
    } as MediaRecord);
    id.onsuccess = () => resolve(id.result as number);
    id.onerror = () => reject(id.error as DOMException);
  });
}

export async function getAllMedia(store: StoreName): Promise<MediaRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const rq = tx.objectStore(store).getAll();
    rq.onsuccess = () => resolve(rq.result as MediaRecord[]);
    rq.onerror = () => reject(rq.error as DOMException);
  });
}

export async function deleteMedia(store: StoreName, id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const rq = tx.objectStore(store).delete(id);
    rq.onsuccess = () => resolve();
    rq.onerror = () => reject(rq.error as DOMException);
  });
}
