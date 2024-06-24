// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchatapp-991ef.firebaseapp.com",
    projectId: "reactchatapp-991ef",
    storageBucket: "reactchatapp-991ef.appspot.com",
    messagingSenderId: "354715433473",
    appId: "1:354715433473:web:6ff42f1613a1d7a4255e00",
    measurementId: "G-B60W47DG0X"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage= getStorage()
// const analytics = getAnalytics(app);