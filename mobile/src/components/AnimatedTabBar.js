import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/theme';

const ICONS   = { Home: '⬡', Programas: '◇', Cartinhas: '✉' };
const LABELS  = { Home: 'início', Programas: 'programas', Cartinhas: 'cartinhas' };
const ACCENTS = { Home: colors.goldLight, Programas: colors.tealLight, Cartinhas: colors.roseLight };

function TabItem({ route, isFocused, onPress }) {
  const scale      = useRef(new Animated.Value(isFocused ? 1 : 0.85)).current;
  const translateY = useRef(new Animated.Value(isFocused ? -2 : 0)).current;
  const opacity    = useRef(new Animated.Value(isFocused ? 1 : 0.45)).current;
  const dotScale   = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,      { toValue: isFocused ? 1 : 0.85, useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.spring(translateY, { toValue: isFocused ? -2 : 0,   useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.timing(opacity,    { toValue: isFocused ? 1 : 0.45, useNativeDriver: true, duration: 200 }),
      Animated.spring(dotScale,   { toValue: isFocused ? 1 : 0,    useNativeDriver: true, damping: 14, stiffness: 180 }),
    ]).start();
  }, [isFocused]);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const accent = ACCENTS[route.name];

  return (
    <TouchableOpacity style={s.tab} onPress={handlePress} activeOpacity={1}>
      <Animated.Text style={[
        s.icon,
        { color: isFocused ? accent : colors.hint },
        { transform: [{ scale }, { translateY }], opacity },
      ]}>
        {ICONS[route.name]}
      </Animated.Text>
      <Text style={[s.label, { color: isFocused ? accent : colors.hint }]}>
        {LABELS[route.name]}
      </Text>
      <Animated.View style={[
        s.dot,
        { backgroundColor: accent },
        { transform: [{ scaleX: dotScale }], opacity: dotScale },
      ]} />
    </TouchableOpacity>
  );
}

export default function AnimatedTabBar({ state, navigation }) {
  return (
    <View style={s.bar}>
      {state.routes.map((route, index) => (
        <TabItem
          key={route.key}
          route={route}
          isFocused={state.index === index}
          onPress={() => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) navigation.navigate(route.name);
          }}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar:   { flexDirection: 'row', backgroundColor: colors.bg, borderTopWidth: 0.5, borderTopColor: colors.border, paddingBottom: Platform.OS === 'ios' ? 28 : 8, paddingTop: 10 },
  tab:   { flex: 1, alignItems: 'center', gap: 4 },
  icon:  { fontSize: 20, lineHeight: 24 },
  label: { fontFamily: 'DMMono_300Light', fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' },
  dot:   { width: 16, height: 1, borderRadius: 1, marginTop: 2 },
});
