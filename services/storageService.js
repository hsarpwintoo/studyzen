/**
 * Storage Service
 * Helpers for Firebase Storage (file uploads / downloads).
 *
 * Usage example:
 *   import { uploadFile, getDownloadURL, deleteFile } from '../services/storageService';
 *
 *   // Upload a profile picture
 *   const url = await uploadFile(`avatars/${uid}.jpg`, blobOrFile);
 *
 *   // Get a download URL for an existing file
 *   const url = await getDownloadURL(`avatars/${uid}.jpg`);
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL as firebaseGetDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload a file and wait for it to complete.
 * Returns the public download URL.
 *
 * @param {string} storagePath  - e.g. 'avatars/user123.jpg'
 * @param {Blob|File|Uint8Array} file
 * @param {object} metadata     - Optional Firebase metadata object
 */
export const uploadFile = async (storagePath, file, metadata = {}) => {
  const fileRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(fileRef, file, metadata);
  return firebaseGetDownloadURL(snapshot.ref);
};

/**
 * Upload a file with progress tracking.
 * Returns an UploadTask — attach .on('state_changed', ...) to monitor progress.
 *
 * @param {string} storagePath
 * @param {Blob|File|Uint8Array} file
 * @param {function} onProgress  - Receives { bytesTransferred, totalBytes, percent }
 * @param {function} onComplete  - Receives the download URL when done
 * @param {function} onError     - Receives the error
 */
export const uploadFileWithProgress = (
  storagePath,
  file,
  onProgress,
  onComplete,
  onError
) => {
  const fileRef = ref(storage, storagePath);
  const task = uploadBytesResumable(fileRef, file);

  task.on(
    'state_changed',
    (snapshot) => {
      const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress?.({ bytesTransferred: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes, percent });
    },
    (error) => onError?.(error),
    async () => {
      const url = await firebaseGetDownloadURL(task.snapshot.ref);
      onComplete?.(url);
    }
  );

  return task; // caller can call task.cancel() if needed
};

/**
 * Get the public download URL for a file already in Storage.
 */
export const getDownloadURL = (storagePath) =>
  firebaseGetDownloadURL(ref(storage, storagePath));

/**
 * Delete a file from Storage.
 */
export const deleteFile = (storagePath) => deleteObject(ref(storage, storagePath));

/**
 * List all files under a storage folder path.
 * Returns an array of { name, fullPath, downloadURL } objects.
 */
export const listFiles = async (folderPath) => {
  const listResult = await listAll(ref(storage, folderPath));
  return Promise.all(
    listResult.items.map(async (itemRef) => ({
      name: itemRef.name,
      fullPath: itemRef.fullPath,
      downloadURL: await firebaseGetDownloadURL(itemRef),
    }))
  );
};
