import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ref, set, get } from 'firebase/database';
import { db } from './firebase';

const PROJECT_ID = '4e5a61f0-ced0-4ef0-98d3-1e250f2b0704';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function tokenToKey(token) {
  return token.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function registerToken() {
  if (!Device.isDevice) {
    console.log('[notifications] skipping — not a physical device');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[notifications] permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('cartinhas', {
      name: 'Cartinhas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
  const token = tokenData.data;
  const key   = tokenToKey(token);

  console.log('[notifications] token registered:', token);

  await set(ref(db, `tokens/${key}`), { token, registeredAt: Date.now() });

  return { token, key };
}

export async function notifyNewLetter(senderKey, senderName, preview) {
  console.log('[notifications] notifyNewLetter called, senderKey:', senderKey);
  const snapshot = await get(ref(db, 'tokens'));
  if (!snapshot.exists()) {
    console.log('[notifications] no tokens in DB');
    return;
  }

  const tokens = Object.entries(snapshot.val())
    .filter(([key]) => key !== senderKey)
    .map(([, val]) => val.token);

  if (tokens.length === 0) {
    console.log('[notifications] no other devices to notify');
    return;
  }

  const body = preview.length > 60 ? preview.slice(0, 60) + '…' : preview;

  console.log('[notifications] sending to', tokens);

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(
      tokens.map(to => ({
        to,
        title: `nova cartinha de ${senderName} ✉`,
        body,
        sound: 'default',
        channelId: 'cartinhas',
      }))
    ),
  });

  const json = await res.json();
  console.log('[notifications] push response:', JSON.stringify(json));
}
