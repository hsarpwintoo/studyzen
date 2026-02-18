import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // null    = signed out (default — shows GetStarted immediately)
  // object  = signed in
  const [user, setUser] = useState(null);

  useEffect(() => {
    // onAuthStateChanged fires immediately with current user or null
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
