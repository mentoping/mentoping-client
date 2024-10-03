// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBDFwU0nYg-H9akm-ep3VAXrUJe3cj-PeQ",
  authDomain: "mentoping-3d954.firebaseapp.com",
  projectId: "mentoping-3d954",
  storageBucket: "mentoping-3d954.appspot.com",
  messagingSenderId: "1092427910793",
  appId: "1:1092427910793:web:19737a6bbf927358d94058",
  measurementId: "G-QSP0QTZ3TC"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore 인스턴스 가져오기
const storage = getStorage(app); // Storage 인스턴스 가져오기


export { app, analytics, db ,storage };