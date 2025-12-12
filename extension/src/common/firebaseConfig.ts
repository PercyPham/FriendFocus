import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDAvyS9mYOSFCYsVL_8ADC7Eud3R42sK3k',
  authDomain: 'friend-focus.firebaseapp.com',
  projectId: 'friend-focus',
  storageBucket: 'friend-focus.firebasestorage.app',
  messagingSenderId: '990643947962',
  appId: '1:990643947962:web:9d1944fc9f99872dcdb583',
  measurementId: 'G-1RQBQ9DZP7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
