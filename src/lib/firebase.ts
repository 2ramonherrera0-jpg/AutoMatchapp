import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0220370901",
  appId: "1:771087555517:web:89e148a1474f23e03350d4",
  apiKey: "AIzaSyB7Z0rwfgUrldDT1CDhkTLW-WmHsIo3WFs",
  authDomain: "gen-lang-client-0220370901.firebaseapp.com",
  storageBucket: "gen-lang-client-0220370901.firebasestorage.app",
  messagingSenderId: "771087555517"
};

// Initialize Firebase Core App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust local caching (offline persistence) and multi-tab synchronization.
// This enables the app to run super fast, read from local cache first, and scale to unlimited users
// by saving reads and keeping costs and latency low.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, "ai-studio-automatch-6926fd2f-de3d-4dd5-af4d-2170016f4013");

// Initialize Firebase Authentication
export const auth = getAuth(app);

/**
 * Validate Firebase connection at startup using asynchronous non-blocking read.
 * This guarantees the config is correct and notifies developer of setup status.
 */
export async function validateFirebaseConnection(): Promise<boolean> {
  try {
    // Attempt an asynchronous check from server with a valid even segment (2 segments) path
    await getDocFromServer(doc(db, 'system_tests', 'connection_test_placeholder'));
    console.log("Conexión con Firebase validada con éxito.");
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Advertencia de Firebase: El cliente está desconectado. Se utilizarán recursos en caché.");
    } else {
      console.error("Error de conexión de Firebase. Por favor, revisa tus credenciales:", error);
    }
    return false;
  }
}

// Automatically trigger connection check on background task thread asynchronously
validateFirebaseConnection();
