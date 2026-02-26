import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // true until Firebase resolves the persisted session (prevents auth flash)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
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
