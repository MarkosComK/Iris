import { ref, set, onValue } from 'firebase/database';
import { db } from './firebase';

export const AUTHOR_COLORS = {
  markos: '#c9a84c',
  iris:   '#c46b8a',
};

export function sendDrawing(author, strokes) {
  return set(ref(db, `drawings/${author}`), {
    timestamp: Date.now(),
    strokes,
  });
}

export function subscribeToDrawing(author, callback) {
  return onValue(ref(db, `drawings/${author}`), snap => callback(snap.val()));
}
