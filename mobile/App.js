import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';

import HomeScreen      from './src/screens/HomeScreen';
import ProgramasScreen from './src/screens/ProgramasScreen';
import CartinhasScreen from './src/screens/CartinhasScreen';
import AnimatedTabBar  from './src/components/AnimatedTabBar';
import { registerToken } from './src/lib/notifications';
import { colors } from './src/lib/theme';

const Tab = createBottomTabNavigator();

// Shared ref so CartinhasScreen can access the current device's token key
export const myTokenKey = { current: null };

export default function App() {
  const notificationListener = useRef();

  useEffect(() => {
    registerToken().then(result => {
      if (result) myTokenKey.current = result.key;
    });

    // Listen for taps on notifications while app is open
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // navigate to Cartinhas tab on notification tap — handled via linking in future
    });

    return () => Notifications.removeNotificationSubscription(notificationListener.current);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bg,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontFamily: 'CormorantGaramond_300Light',
            fontSize: 18,
            color: colors.text,
          },
          headerTintColor: colors.text,
          animation: 'fade',
          animationDuration: 180,
        }}
      >
        <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Para Iris'  }} />
        <Tab.Screen name="Programas" component={ProgramasScreen} options={{ title: 'Programas'  }} />
        <Tab.Screen name="Cartinhas" component={CartinhasScreen} options={{ title: 'Cartinhas'  }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
