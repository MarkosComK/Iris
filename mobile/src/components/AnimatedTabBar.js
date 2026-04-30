import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/theme';

const ICONS = { Home: '⬡', Programas: '◇', Cartinhas: '✉' };
const LABELS = { Home: 'início', Programas: 'programas', Cartinhas: 'cartinhas' };

const SPRING = { damping: 14, stiffness: 180, mass: 0.6 };

function TabItem({ route, isFocused, onPress }) {
  const scale  = useSharedValue(isFocused ? 1 : 0.85);
  const opacity = useSharedValue(isFocused ? 1 : 0.45);
  const translateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    scale.value     = withSpring(isFocused ? 1 : 0.85, SPRING);
    opacity.value   = withTiming(isFocused ? 1 : 0.45, { duration: 200 });
    translateY.value = withSpring(isFocused ? -2 : 0, SPRING);
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: withSpring(isFocused ? 1 : 0, SPRING) }],
    opacity: withTiming(isFocused ? 1 : 0, { duration: 180 }),
  }));

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const accentColor = route.name === 'Cartinhas'
    ? colors.roseLight
    : route.name === 'Programas'
    ? colors.tealLight
    : colors.goldLight;

  return (
    <TouchableOpacity style={s.tab} onPress={handlePress} activeOpacity={1}>
      <Animated.Text style={[s.icon, { color: isFocused ? accentColor : colors.hint }, iconStyle]}>
        {ICONS[route.name]}
      </Animated.Text>
      <Text style={[s.label, { color: isFocused ? accentColor : colors.hint }]}>
        {LABELS[route.name]}
      </Text>
      <Animated.View style={[s.dot, { backgroundColor: accentColor }, dotStyle]} />
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
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontFamily: 'DMMono_300Light',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dot: {
    width: 16,
    height: 1,
    borderRadius: 1,
    marginTop: 2,
  },
});
