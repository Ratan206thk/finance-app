/**
 * Firebase Service
 * Handles real-time cloud sync with fallback to localStorage
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { AppState } from '../types';

const firebaseConfig = {
  apiKey: 'AIzaSyC3oaaEp8QPRtj_tmPf1ps9BHuxZhGnYfs',
  authDomain: 'finances-track.firebaseapp.com',
  projectId: 'finances-track',
  storageBucket: 'finances-track.firebasestorage.app',
  messagingSenderId: '349966626382',
  appId: '1:349966626382:web:c5ca8c22042609cacf5d1f',
};

const SYNC_ID = 'finance-hiyuth-track';

let fbApp: any = null;
let db: any = null;
let docRef: any = null;
let firestoreReady = false;
let unsubscribe: Unsubscribe | null = null;

export function initFirebase(): boolean {
  try {
    fbApp = initializeApp(firebaseConfig);
    db = getFirestore(fbApp);
    docRef = doc(db, 'financeApp', SYNC_ID);
    firestoreReady = true;
    return true;
  } catch (e) {
    console.error('Firebase init failed — app will run on local storage only.', e);
    return false;
  }
}

export async function writeToFirestore(state: AppState): Promise<void> {
  if (!firestoreReady || !docRef) return Promise.resolve();
  try {
    await setDoc(docRef, {
      state,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Firestore write failed:', err);
    throw err;
  }
}

export function startRealtimeSync(
  onUpdate: (state: AppState) => void,
  onError?: (err: Error) => void
): () => void {
  if (!firestoreReady || !docRef) return () => {};

  unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        if (data && data.state) {
          onUpdate(data.state);
        }
      }
    },
    (error) => {
      console.warn('Firestore sync listener error:', error);
      if (onError) onError(error as Error);
    }
  );

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

export function isFirestoreReady(): boolean {
  return firestoreReady;
}
