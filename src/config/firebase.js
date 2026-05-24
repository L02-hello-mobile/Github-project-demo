// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWCl-CZTyFBSOzaUv9_ctPAFanjkA2mIc",
  authDomain: "eventflow-7a3e7.firebaseapp.com",
  projectId: "eventflow-7a3e7",
  storageBucket: "eventflow-7a3e7.firebasestorage.app",
  messagingSenderId: "1077285021186",
  appId: "1:1077285021186:web:7e5f3b248dea5d4f8ee91b",
  measurementId: "G-XX36HSS904"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics, logEvent };