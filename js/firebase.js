// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsvRjG8XHKCw_ySSqWk8sXm5X0vVgWg3U",
  authDomain: "dana-boutique.firebaseapp.com",
  projectId: "dana-boutique",
  storageBucket: "dana-boutique.firebasestorage.app",
  messagingSenderId: "468114494092",
  appId: "1:468114494092:web:7bd33fe3c7a03a40d961a9",
  measurementId: "G-1T3D84HYE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);