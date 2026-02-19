/**
 * Firestore Service
 * Generic CRUD helpers for Cloud Firestore.
 *
 * Usage example:
 *   import { setDocument, getDocument, queryCollection } from '../services/firestoreService';
 *
 *   // Save a study plan
 *   await setDocument('studyPlans', planId, { title, tasks, userId });
 *
 *   // Read it back
 *   const plan = await getDocument('studyPlans', planId);
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Create or overwrite a document.
 * @param {string} collectionName
 * @param {string} docId
 * @param {object} data
 */
export const setDocument = (collectionName, docId, data) =>
  setDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() });

/**
 * Partially update an existing document.
 */
export const updateDocument = (collectionName, docId, data) =>
  updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() });

/**
 * Delete a document.
 */
export const deleteDocument = (collectionName, docId) =>
  deleteDoc(doc(db, collectionName, docId));

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Fetch a single document. Returns the data object or null if not found.
 */
export const getDocument = async (collectionName, docId) => {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Fetch all documents in a collection.
 */
export const getCollection = async (collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Query a collection with optional filters, ordering, and limit.
 *
 * @param {string} collectionName
 * @param {Array}  filters   - Array of [field, operator, value] tuples
 * @param {string} orderField
 * @param {number} limitCount
 *
 * Example:
 *   queryCollection('studyPlans', [['userId', '==', uid]], 'createdAt', 10)
 */
export const queryCollection = async (
  collectionName,
  filters = [],
  orderField = null,
  limitCount = null
) => {
  const constraints = filters.map(([field, op, val]) => where(field, op, val));
  if (orderField) constraints.push(orderBy(orderField));
  if (limitCount) constraints.push(limit(limitCount));

  const snap = await getDocs(query(collection(db, collectionName), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Real-time ────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time updates on a collection query.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {string}   collectionName
 * @param {Array}    filters
 * @param {function} onData   - Receives array of documents
 * @param {function} onError  - Receives error
 */
export const subscribeToCollection = (collectionName, filters = [], onData, onError) => {
  const constraints = filters.map(([field, op, val]) => where(field, op, val));
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};

// ─── Per-User Collection Helpers ─────────────────────────────────────────────

/** Real-time listener for a user's sub-collection. Returns unsubscribe fn. */
export const listenToUserCollection = (uid, subcollection, callback) =>
  onSnapshot(
    collection(db, 'users', uid, subcollection),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

/** Create or merge-update a document in a user's sub-collection. */
export const saveUserTask = (uid, subcollection, taskId, data) =>
  setDoc(doc(db, 'users', uid, subcollection, taskId), data, { merge: true });

/** Add a new document with auto-generated ID in a user's sub-collection. */
export const addUserDocument = (uid, subcollection, data) =>
  addDoc(collection(db, 'users', uid, subcollection), { ...data, createdAt: serverTimestamp() });

/** Delete a document from a user's sub-collection. */
export const deleteUserDocument = (uid, subcollection, docId) =>
  deleteDoc(doc(db, 'users', uid, subcollection, docId));
