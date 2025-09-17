import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import Cookies from "js-cookie";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export type UserRole =
  | "doctor"
  | "pharmacist"
  | "technician"
  | "receptionist"
  | "staff-nurse";

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRole = Cookies.get("userRole");
        const userName = Cookies.get("userName");

        // Check if both cookies exist
        if (userRole && userName) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: userRole as UserRole,
            name: userName,
          });
        } else {
          // If cookies are missing, but a Firebase user exists, we have an inconsistency.
          // This can happen on app start or if cookies are cleared.
          // Re-fetch user data from Firestore to ensure integrity.
          const q = query(
            collection(db, "doctors"), // Assuming 'doctors' is the primary source
            where("email", "==", firebaseUser.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doctorData = querySnapshot.docs[0].data();
            const fetchedRole = "doctor"; // Assume doctor if found in doctors collection
            const fetchedName = doctorData.doc_name;

            Cookies.set("userRole", fetchedRole, { expires: 7 });
            Cookies.set("userName", fetchedName, { expires: 7 });

            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: fetchedRole as UserRole,
              name: fetchedName,
            });
          }
        }
      } else {
        setUser(null);
        Cookies.remove("userRole");
        Cookies.remove("userName");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      // The actual login logic is now handled by the LoginPage component
      // This context function is just to be consistent with the provided structure.
      // Since LoginPage handles it, we can leave this simple or remove it.
      // For now, let's keep it but note that its use is optional with the new structure.
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing the user state and cookies
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
