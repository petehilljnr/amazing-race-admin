// Utility for offline image upload queue using IndexedDB
// Uses idb-keyval for simplicity
import { set, get, del, update, keys } from 'idb-keyval';

const QUEUE_KEY_PREFIX = 'image-upload-';

export async function queueImageUpload({ id, file, metadata }) {
  // id: unique identifier for the upload (e.g., uuid)
  // file: Blob/File
  // metadata: { ...task info }
  await set(QUEUE_KEY_PREFIX + id, { file, metadata });
}

export async function getQueuedUploads() {
  const allKeys = await keys();
  const queueKeys = allKeys.filter(k => k.startsWith(QUEUE_KEY_PREFIX));
  const uploads = [];
  for (const key of queueKeys) {
    const data = await get(key);
    uploads.push({ id: key.replace(QUEUE_KEY_PREFIX, ''), ...data });
  }
  return uploads;
}

export async function removeQueuedUpload(id) {
  await del(QUEUE_KEY_PREFIX + id);
}

export async function updateQueuedUpload(id, updater) {
  await update(QUEUE_KEY_PREFIX + id, updater);
}

// Usage:
// await queueImageUpload({ id, file, metadata });
// const uploads = await getQueuedUploads();
// await removeQueuedUpload(id);
