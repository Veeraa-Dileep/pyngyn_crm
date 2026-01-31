// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH1JF6jEJsw2Lv8Ru1T9ZjgCGNMBf-rEU",
  authDomain: "pyngyn-crm.firebaseapp.com",
  projectId: "pyngyn-crm",
  storageBucket: "pyngyn-crm.firebasestorage.app",
  messagingSenderId: "624213930696",
  appId: "1:624213930696:web:ace96a23279aa48e7aabfd"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
