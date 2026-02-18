/**
 * Realtime Database Service
 * Helpers for Firebase Realtime Database (ideal for live-synced data
 * such as active focus-timer sessions or presence indicators).
 *
 * Usage example:
 *   import { writeData, readData, subscribeToPath } from '../services/realtimeDbService';
 *
 *   // Start a focus session
 *   await writeData(`sessions/${uid}`, { startedAt: Date.now(), active: true });
 *
 *   // Listen for changes
 *   const unsub = subscribeToPath(`sessions/${uid}`, (data) => console.log(data));
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';
import { rtdb } from '../config/firebase';

// ─── Write ───────────────────────────────────────────────────────────────────

/** Overwrite data at a path. */
export const writeData = (path, data) => set(ref(rtdb, path), data);

/** Merge-update data at a path. */
export const updateData = (path, data) => update(ref(rtdb, path), data);

/** Remove data at a path. */
export const removeData = (path) => remove(ref(rtdb, path));

/** Push a new child to a list and return its generated key. */
export const pushData = async (path, data) => {
  const newRef = push(ref(rtdb, path));
  await set(newRef, data);
  return newRef.key;
};

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Read data at a path once. Returns the value or null.
 */
export const readData = async (path) => {
  const snap = await get(ref(rtdb, path));
  return snap.exists() ? snap.val() : null;
};

// ─── Real-time ────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time updates at a database path.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {string}   path
 * @param {function} onData  - Receives the current value (or null)
 */
export const subscribeToPath = (path, onData) => {
  const dbRef = ref(rtdb, path);
  onValue(dbRef, (snap) => onData(snap.exists() ? snap.val() : null));
  // Return cleanup function
  return () => off(dbRef);
};

/** Convenience: Firebase server timestamp for RTDB. */
export const rtdbTimestamp = () => serverTimestamp();
