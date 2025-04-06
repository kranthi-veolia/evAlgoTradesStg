// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth  } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBxmOR3lwM-siz2Qwx1SsgqQvWWSweJmgc",
//   authDomain: "evallgotraging.firebaseapp.com",
//   projectId: "evallgotraging",
//   storageBucket: "evallgotraging.firebasestorage.app",
//   messagingSenderId: "944428211592",
//   appId: "1:944428211592:web:3b7196470e0599a4586e3d",
//   measurementId: "G-SGYXR4NNYC"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDTDxI2sr-EAL_lyBTY4N64ZPx7xvNvceQ",
  authDomain: "evalgotradingproj.firebaseapp.com",
  projectId: "evalgotradingproj",
  storageBucket: "evalgotradingproj.firebasestorage.app",
  messagingSenderId: "703086075500",
  appId: "1:703086075500:web:4c9edfba06fee83a950249"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);