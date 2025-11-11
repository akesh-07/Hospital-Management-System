// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth"; // Import getAuth and Auth

// Define Firebase config type (optional but good practice)
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyCBwv3IWcEXKWoitdkRQ4o99uGfqJwhucM",
  authDomain: "learning-a0833.firebaseapp.com",
  projectId: "learning-a0833",
  storageBucket: "learning-a0833.appspot.com",
  messagingSenderId: "127443399566",
  appId: "1:127443399566:web:eb6f8fa7a29afa3e73aadf",
  measurementId: "G-77PJ0J5M47",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth instances
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app); // Initialize and export the auth instance
