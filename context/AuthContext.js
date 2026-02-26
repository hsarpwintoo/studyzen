import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // true until Firebase resolves the persisted session (prevents auth flash)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        // Backfill: write profile doc if it has no name/email fields yet
        try {
          const ref = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists() || !snap.data()?.email) {
            await setDoc(ref, {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              createdAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (_) {}
      }
      setUser(firebaseUser ?? null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
