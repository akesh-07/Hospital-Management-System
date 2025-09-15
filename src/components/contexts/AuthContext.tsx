// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext } from "react";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
 // Import auth and db from your firebase config

export type UserRole =
  | "doctor"
  | "pharmacist"
  | "technician"
  | "receptionist"
  | "staff-nurse";

interface AuthContextType {
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Save additional user data (name and role) to a "users" collection in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      console.log("User registered and data saved to Firestore:", user);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error);
      setIsLoading(false);
      // You can return a more specific error message based on the Firebase error code
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};