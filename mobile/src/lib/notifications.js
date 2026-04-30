import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ref, set, get } from 'firebase/database';
import { db } from './firebase';

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
  // Push tokens only work in a real build, not Expo Go — skip silently
  if (!Device.isDevice) return null;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('cartinhas', {
        name: 'Cartinhas',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    const key = tokenToKey(token);

    await set(ref(db, `tokens/${key}`), { token, registeredAt: Date.now() });

    return { token, key };
  } catch {
    // Silently fails in Expo Go — will work in production build
    return null;
  }
}

export async function notifyNewLetter(senderKey, senderName, preview) {
  try {
    const snapshot = await get(ref(db, 'tokens'));
    if (!snapshot.exists()) return;

    const tokens = Object.entries(snapshot.val())
      .filter(([key]) => key !== senderKey)
      .map(([, val]) => val.token);

    if (tokens.length === 0) return;

    const body = preview.length > 60 ? preview.slice(0, 60) + '…' : preview;

    await fetch('https://exp.host/--/api/v2/push/send', {
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
  } catch {
    // Silently fails in Expo Go
  }
}
