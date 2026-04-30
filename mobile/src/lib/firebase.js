import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey:            'AIzaSyB1wOAWC3qE-osPs9UhGbrvcQ1PxAiu81s',
  authDomain:        'iris-a9ccc.firebaseapp.com',
  databaseURL:       'https://iris-a9ccc-default-rtdb.firebaseio.com',
  projectId:         'iris-a9ccc',
  storageBucket:     'iris-a9ccc.firebasestorage.app',
  messagingSenderId: '604325284992',
  appId:             '1:604325284992:web:903490fc7d6d16c9542a65',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
