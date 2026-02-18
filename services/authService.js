/**
 * Authentication Service
 * Wraps Firebase Auth methods for Email/Password authentication.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Register a new user with email and password.
 * Optionally sets a display name on the profile.
 */
export const registerUser = async (email, password, displayName = '') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
};

/**
 * Sign in an existing user.
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign out the currently authenticated user.
 */
export const logoutUser = () => signOut(auth);

/**
 * Send a password-reset email.
 */
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

/**
 * Subscribe to authentication state changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {function} callback - Receives the user object (or null when signed out)
 */
export const subscribeToAuthChanges = (callback) => onAuthStateChanged(auth, callback);

/** Convenience getter for the currently signed-in user (may be null). */
export const getCurrentUser = () => auth.currentUser;
