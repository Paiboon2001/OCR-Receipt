import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import {
  FileIcon,
  InvoiceIcon,
  MaximizeIcon,
  MoneyIcon,
  QrCodeIcon,
} from '../components/CoverIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Cover'>;

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/** A small floating glass card overlaid on the scanning frame. */
function InfoCard({
  icon,
  label,
  value,
  labelColor = '#0478ff',
  valueSize = 14,
  iconSize = 32,
  style,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  labelColor?: string;
  valueSize?: number;
  iconSize?: number;
  style?: object;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.cardIcon, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}>
        {icon}
      </View>
      <View>
        <Text style={[styles.cardLabel, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.cardValue, { fontSize: valueSize }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function CoverScreen({ navigation }: Props) {
  // Animated scanning line that sweeps top → bottom of the frame.
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const openScanner = () => navigation.navigate('ScanDocs');

  return (
    <LinearGradient
      colors={['#ffffff', '#d0eeff']}
      locations={[0, 1]}
      style={styles.root}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>OCR Receipt</Text>
          <Text style={styles.subtitle}>
            Automatically extract billing information
          </Text>
        </View>

        {/* Scanning frame */}
        <View style={styles.frameWrap}>
          <View
            style={styles.frame}
            onLayout={() => {}}>
            <Image
              source={require('../assets/camera_preview.png')}
              style={styles.preview}
              resizeMode="cover"
            />
            {/* Soft overlay so cards pop */}
            <LinearGradient
              colors={['rgba(249,249,252,0.8)', 'rgba(249,249,252,0)', 'rgba(249,249,252,0.9)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Animated scanning line */}
            <Animated.View
              style={[
                styles.scanLineWrap,
                {
                  transform: [
                    {
                      translateY: scan.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, FRAME_TRAVEL],
                      }),
                    },
                  ],
                },
              ]}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['rgba(0,88,188,0)', '#0877ff', 'rgba(0,88,188,0)']}
                style={styles.scanLine}
              />
            </Animated.View>

            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Floating cards */}
            <InfoCard
              style={styles.cardInvoice}
              icon={<InvoiceIcon size={15} />}
              label="INVOICE NO"
              value="BMS-99999"
            />
            <InfoCard
              style={styles.cardCompany}
              icon={<FileIcon size={18} />}
              label="TAX INVOICE"
              value="Nexus Utilities"
              labelColor="#0d67f0"
            />
            <InfoCard
              style={styles.cardAmount}
              icon={<MoneyIcon size={20} />}
              label="BILL RECEIPT"
              value="฿245.50"
              valueSize={20}
              iconSize={40}
            />
          </View>
        </View>

        {/* Capture controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={openScanner}
            style={({ pressed }) => [styles.captureBtn, pressed && { opacity: 0.9 }]}>
            <LinearGradient
              colors={['#6c6e74', '#000000']}
              style={styles.captureGradient}>
              <View style={styles.scanIconStack}>
                <MaximizeIcon size={40} />
                <View style={styles.qrOverlay}>
                  <QrCodeIcon size={24} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('QrLogin')}
            style={styles.loginPill}>
            <Text style={styles.loginText}>Scan QR to Login</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

// Approximate vertical travel of the scan line inside the frame.
const FRAME_TRAVEL = 460;

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingTop: 88,
    paddingBottom: 40,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', paddingBottom: 40 },
  title: {
    fontFamily: SERIF,
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1c1e',
    letterSpacing: -0.72,
    lineHeight: 44,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
  },
  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 384,
    width: '100%',
    alignSelf: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(5,122,255,0.3)',
    overflow: 'hidden',
    // shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 4,
  },
  preview: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  scanLineWrap: {
    position: 'absolute',
    left: -1,
    right: -1,
    top: 0,
    height: 3,
  },
  scanLine: {
    flex: 1,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#0478ff',
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },

  // Cards
  card: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(9,114,255,0.15)',
    borderRadius: 12,
    padding: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  cardIcon: {
    backgroundColor: '#ebf1fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontWeight: '600',
    color: '#1a1c1e',
    lineHeight: 20,
    marginTop: 1,
  },
  cardInvoice: { top: '14%', left: -8 },
  cardCompany: { top: '45%', right: -8 },
  cardAmount: { bottom: '17%', left: 4 },

  // Controls
  controls: { alignItems: 'center', paddingTop: 32, paddingBottom: 16 },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  captureGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanIconStack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qrOverlay: { position: 'absolute' },
  loginPill: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9fcbff',
    borderRadius: 9999,
    paddingHorizontal: 17,
    paddingVertical: 7,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#414755',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
