import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAvXvDYQJvN3IKasPY3umDFhmUTdqP6jjQ",
  authDomain: "coursework4-3a77c.firebaseapp.com",
  projectId: "coursework4-3a77c",
  storageBucket: "coursework4-3a77c.firebasestorage.app",
  messagingSenderId: "203296746982",
  appId: "1:203296746982:web:683e9478ef8b346fdb3a27",
  measurementId: "G-Q32897VL4E"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export { app, analytics };