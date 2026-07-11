import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App dynamically/safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// Request standard profile & email scopes
googleProvider.addScope("openid");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

export { auth };

/**
 * Trigger popup-based Google login via Firebase SDK
 */
export const signInWithGoogle = async (): Promise<{ user: User; idToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken,
    };
  } catch (error: any) {
    console.error("Firebase Sign In Error:", error);
    throw error;
  }
};

/**
 * Sign out from Firebase
 */
export const logOutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase Sign Out Error:", error);
  }
};
