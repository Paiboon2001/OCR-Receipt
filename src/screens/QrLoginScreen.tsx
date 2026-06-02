import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { MaximizeIcon, QrCodeIcon } from '../components/CoverIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'QrLogin'>;

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

const CAMERA_HEIGHT = 324;
const LINE_TOP = 20;
const LINE_BOTTOM = CAMERA_HEIGHT - 28;

function CloseIcon({ size = 24, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function QrLoginScreen({ navigation }: Props) {
  const scan = useRef(new Animated.Value(0)).current;
  const navigatedRef = useRef(false);

  // Camera setup
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Navigate forward exactly once (on a detected QR or the manual fallback).
  const proceed = useCallback(() => {
    if (navigatedRef.current) {
      return;
    }
    navigatedRef.current = true;
    navigation.replace('Tabs', { screen: 'Scan' });
  }, [navigation]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        proceed();
      }
    },
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const close = () => navigation.goBack();
  const cameraReady = !!device && hasPermission;

  return (
    <View style={styles.root}>
      {/* Close */}
      <Pressable onPress={close} hitSlop={12} style={styles.close}>
        <CloseIcon size={24} />
      </Pressable>

      {/* Scanner viewport — tap acts as the manual fallback (e.g. on a simulator
          that has no camera, or before the QR is recognised). */}
      <View style={styles.viewportArea}>
        <Pressable onPress={proceed} style={styles.viewportContainer}>
          <View style={styles.cameraView}>
            {/* Live camera feed */}
            {cameraReady ? (
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
              />
            ) : (
              <View style={styles.cameraFallback}>
                <Text style={styles.fallbackText}>
                  {hasPermission
                    ? 'No camera available on this device.\nTap to continue.'
                    : 'Camera permission needed.\nTap to continue.'}
                </Text>
              </View>
            )}

            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated scan line + trailing gradient */}
            <Animated.View
              style={[
                styles.scanGroup,
                {
                  transform: [
                    {
                      translateY: scan.interpolate({
                        inputRange: [0, 1],
                        outputRange: [LINE_TOP, LINE_BOTTOM],
                      }),
                    },
                  ],
                },
              ]}>
              <LinearGradient
                colors={['rgba(0,88,188,0)', 'rgba(0,88,188,0.2)']}
                style={styles.scanTrail}
              />
              <View style={styles.scanLine} />
            </Animated.View>
          </View>
        </Pressable>
      </View>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.scanIconStack}>
          <MaximizeIcon size={40} color="#0058bc" />
          <View style={styles.qrOverlay}>
            <QrCodeIcon size={24} color="#0058bc" />
          </View>
        </View>
        <Text style={styles.title}>Scan QR to Login</Text>
        <Text style={styles.subtitle}>Securely login by scanning your QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'space-between',
  },
  close: {
    position: 'absolute',
    top: 40,
    right: 24,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewportArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  viewportContainer: {
    width: 342,
    padding: 8,
    borderRadius: 32,
  },
  cameraView: {
    height: CAMERA_HEIGHT,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cameraFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  fallbackText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: '#0058bc',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanGroup: { position: 'absolute', left: 32, right: 32, top: 0 },
  scanTrail: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 96 },
  scanLine: {
    height: 4,
    borderRadius: 9999,
    backgroundColor: '#0058bc',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 6,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  scanIconStack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrOverlay: { position: 'absolute' },
  title: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1c1e',
    lineHeight: 32,
    textAlign: 'center',
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#414755',
    lineHeight: 20,
    textAlign: 'center',
  },
});
