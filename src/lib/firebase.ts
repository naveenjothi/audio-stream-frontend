import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization during hot reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Auth functions
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Re-authenticate user with email/password (required before sensitive operations)
export async function reauthenticateUser(password: string) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    return {
      success: false,
      error: new Error("No user logged in or no email associated"),
    };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Update password for existing user
export async function updateUserPassword(newPassword: string) {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: new Error("No user logged in") };
  }

  try {
    await firebaseUpdatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Create new account with email/password
export async function createAccount(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Delete user account
export async function deleteUserAccount() {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: new Error("No user logged in") };
  }

  try {
    await firebaseDeleteUser(user);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Check if user has password provider (vs just Google)
export function hasPasswordProvider(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some(
    (provider) => provider.providerId === "password"
  );
}

// Check if user has Google provider
export function hasGoogleProvider(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
}

export { auth, app };
export type { FirebaseUser };
