import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    return signOut(auth);
  };

  const checkAdminStatus = async (user) => {
    if (!user) return null;
    
    try {
      const adminDoc = await getDoc(doc(db, "admin", user.uid));
      
      if (!adminDoc.exists()) {
        await signOut(auth);
        return null;
      }
      
      const adminData = adminDoc.data();
      if (!adminData.isAdmin) {
        await signOut(auth);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error("Error checking admin status:", error);
      await signOut(auth);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const validatedUser = await checkAdminStatus(user);
        setCurrentUser(validatedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};