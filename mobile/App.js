import 'react-native-gesture-handler';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen      from './src/screens/HomeScreen';
import ProgramasScreen from './src/screens/ProgramasScreen';
import CartinhasScreen from './src/screens/CartinhasScreen';
import AnimatedTabBar  from './src/components/AnimatedTabBar';
import { registerToken } from './src/lib/notifications';
import { myTokenKey }   from './src/lib/tokenStore';
import { colors }       from './src/lib/theme';

const SCREENS = [
  { name: 'Home',      title: 'Para Iris', Component: HomeScreen      },
  { name: 'Programas', title: 'Programas', Component: ProgramasScreen },
  { name: 'Cartinhas', title: 'Cartinhas', Component: CartinhasScreen },
];

function Pager() {
  const { width }    = useWindowDimensions();
  const scrollRef    = useRef(null);
  const [active, setActive] = useState(0);
  const titleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    registerToken().then(r => { if (r) myTokenKey.current = r.key; });
  }, []);

  const fadeTitle = useCallback(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 0, duration: 80,  useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [titleOpacity]);

  const goToTab = useCallback((index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    fadeTitle();
    setActive(index);
  }, [width, fadeTitle]);

  const onSwipeEnd = useCallback((e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== active) {
      fadeTitle();
      setActive(index);
    }
  }, [width, active, fadeTitle]);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Animated.Text style={[s.headerTitle, { opacity: titleOpacity }]}>
          {SCREENS[active].title}
        </Animated.Text>
      </View>

      {/* Swipeable pager — all screens mounted, no blink ever */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSwipeEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        style={s.pager}
      >
        {SCREENS.map(({ name, Component }) => (
          <View key={name} style={{ width }}>
            <Component />
          </View>
        ))}
      </ScrollView>

      <AnimatedTabBar activeIndex={active} onTabPress={goToTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <Pager />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.bg },
  root:        { flex: 1 },
  header:      { height: 48, backgroundColor: colors.bg, borderBottomWidth: 0.5, borderBottomColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'CormorantGaramond_300Light', fontSize: 18, color: colors.text },
  pager:       { flex: 1 },
});
