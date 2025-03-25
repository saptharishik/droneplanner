import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyAxGNDFSoay_JH_dywqJiltQ7u21gBGg2o",
  authDomain: "iroc25.firebaseapp.com",
  databaseURL: "https://iroc25-default-rtdb.firebaseio.com",
  projectId: "iroc25",
  storageBucket: "iroc25.firebasestorage.app",
  messagingSenderId: "1059139853073",
  appId: "1:1059139853073:web:85b3ecc145bda92a14cab0",
  measurementId: "G-NPYPY6BQM5"
};
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;