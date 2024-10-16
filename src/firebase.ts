import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCj5rIzGe95blMf81lLd4P9vhlAdUy_r5Y",
  authDomain: "nwitter-reloaded-77433.firebaseapp.com",
  projectId: "nwitter-reloaded-77433",
  storageBucket: "nwitter-reloaded-77433.appspot.com",
  messagingSenderId: "264750539440",
  appId: "1:264750539440:web:5927999525f986f5c95175",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
