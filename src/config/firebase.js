import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
    apiKey: "AIzaSyAewLZcyumD_aT-Mu0DhSoCB6oxUDd_l7s",
    authDomain: "drone-258a6.firebaseapp.com",
    databaseURL: "https://drone-258a6-default-rtdb.firebaseio.com",
    projectId: "drone-258a6",
    storageBucket: "drone-258a6.firebasestorage.app",
    messagingSenderId: "176910514480",
    appId: "1:176910514480:web:d09d808c1cde87f147b0f5",
    measurementId: "G-QL6QQVY5CJ"
  };
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;