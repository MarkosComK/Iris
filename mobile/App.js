import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen      from './src/screens/HomeScreen';
import ProgramasScreen from './src/screens/ProgramasScreen';
import CartinhasScreen from './src/screens/CartinhasScreen';
import { colors }      from './src/lib/theme';

const Tab = createBottomTabNavigator();

const icons = { Home: '⬡', Programas: '◇', Cartinhas: '✉' };

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle:      { backgroundColor: colors.bg, borderBottomWidth: 0.5, borderBottomColor: colors.border, elevation: 0, shadowOpacity: 0 },
          headerTintColor:  colors.text,
          headerTitleStyle: { fontFamily: 'CormorantGaramond_300Light', fontSize: 18, color: colors.text },
          tabBarStyle:      { backgroundColor: colors.bg, borderTopWidth: 0.5, borderTopColor: colors.border, elevation: 0 },
          tabBarActiveTintColor:   colors.roseLight,
          tabBarInactiveTintColor: colors.hint,
          tabBarLabelStyle: { fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'DMMono_300Light', marginBottom: 4 },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{icons[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Para Iris' }} />
        <Tab.Screen name="Programas" component={ProgramasScreen} options={{ title: 'Programas' }} />
        <Tab.Screen name="Cartinhas" component={CartinhasScreen} options={{ title: 'Cartinhas' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
