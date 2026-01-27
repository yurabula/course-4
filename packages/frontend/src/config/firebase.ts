// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvXvDYQJvN3IKasPY3umDFhmUTdqP6jjQ",
  authDomain: "coursework4-3a77c.firebaseapp.com",
  projectId: "coursework4-3a77c",
  storageBucket: "coursework4-3a77c.firebasestorage.app",
  messagingSenderId: "203296746982",
  appId: "1:203296746982:web:683e9478ef8b346fdb3a27",
  measurementId: "G-Q32897VL4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);  // <- Ось цей рядок
export { app, analytics };