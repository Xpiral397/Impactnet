import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface InfinityLogoProps {
  size?: number;
}

export default function InfinityLogo({ size = 90 }: InfinityLogoProps) {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Small wave animation to the left
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: -3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ translateX: waveAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Infinity symbol - exact replica */}
          <Path
            d="M 25 50
               C 25 40, 30 35, 35 35
               C 40 35, 45 40, 50 50
               C 55 60, 60 65, 65 65
               C 70 65, 75 60, 75 50
               C 75 40, 70 35, 65 35
               C 60 35, 55 40, 50 50
               C 45 60, 40 65, 35 65
               C 30 65, 25 60, 25 50 Z"
            fill="white"
            strokeWidth="0"
          />
        </Svg>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
