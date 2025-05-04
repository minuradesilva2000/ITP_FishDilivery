// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJO1dVZ_B1Kl5ZoWs8A_taSzUpTUtVOQ0",
  authDomain: "hearbalflow.firebaseapp.com",
  projectId: "hearbalflow",
  storageBucket: "hearbalflow.appspot.com",
  messagingSenderId: "461368842155",
  appId: "1:461368842155:web:c2aa3c9f3be1b158e1a4ee",
  measurementId: "G-NRH5ZGDR5S",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
