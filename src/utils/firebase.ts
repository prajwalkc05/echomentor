import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDcWFh0tF5_iEB8yczT5bNYqJELnYSf8d4',
  authDomain: 'echo-9b717.firebaseapp.com',
  projectId: 'echo-9b717',
  storageBucket: 'echo-9b717.firebasestorage.app',
  messagingSenderId: '473540724222',
  appId: '1:473540724222:web:b552062b06d07becf2acaf',
  measurementId: 'G-JW9FV8PBPB',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async (): Promise<{ name: string; email: string; token: string }> => {
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  return {
    name: result.user.displayName || '',
    email: result.user.email || '',
    token,
  };
};
