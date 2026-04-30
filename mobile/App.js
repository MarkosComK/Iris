import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen      from './src/screens/HomeScreen';
import ProgramasScreen from './src/screens/ProgramasScreen';
import CartinhasScreen from './src/screens/CartinhasScreen';
import AnimatedTabBar  from './src/components/AnimatedTabBar';
import { colors }      from './src/lib/theme';

const Tab = createBottomTabNavigator();

export default function App() {
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
          // Smooth fade + slight upward slide on tab switch
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
