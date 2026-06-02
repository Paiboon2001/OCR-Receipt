import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import {
  CameraIcon,
  CloseIcon,
  GalleryIcon,
  RefreshIcon,
} from '../components/CoverIcons';
import { scanReceipt } from '../services/ocr';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanDocs'>;

export default function ScanDocsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const scan = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

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
    animRef.current = loop;
    loop.start();
    return () => loop.stop();
  }, [scan]);

  async function handleAsset(asset: Asset | undefined) {
    if (!asset?.base64) {
      Alert.alert('อ่านรูปภาพไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
      return;
    }
    setBusy(true);
    try {
      const draft = await scanReceipt({
        base64: asset.base64,
        uri: asset.uri,
        mimeType: asset.type,
      });
      navigation.navigate('ReceiptDetail', { draft, imageUri: asset.uri });
    } catch {
      Alert.alert('สแกนไม่สำเร็จ', 'ระบบ OCR ไม่สามารถอ่านเอกสารนี้ได้');
    } finally {
      setBusy(false);
    }
  }

  async function onCapture() {
    const res = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      saveToPhotos: false,
    });
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('ไม่สามารถใช้กล้องได้', res.errorMessage ?? res.errorCode);
      return;
    }
    handleAsset(res.assets?.[0]);
  }

  async function onPickGallery() {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('ไม่สามารถเปิดคลังรูปได้', res.errorMessage ?? res.errorCode);
      return;
    }
    handleAsset(res.assets?.[0]);
  }

  function onRetake() {
    // Restart the scanning animation as a visual "reset".
    scan.setValue(0);
    animRef.current?.stop();
    animRef.current?.start();
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>สแกนใบเสร็จ/ใบกำกับภาษี</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.close}>
          <CloseIcon size={24} />
        </Pressable>
      </View>

      {/* Scanner viewport */}
      <View style={styles.viewportArea}>
        <View style={styles.viewportContainer}>
          <View style={styles.cameraView}>
            <Image
              source={require('../assets/scan_doc.jpg')}
              style={styles.docImage}
              resizeMode="cover"
            />

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
                        outputRange: [20, 520],
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
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.controlsRow}>
          <Pressable onPress={onRetake} hitSlop={12} style={styles.sideBtn}>
            <RefreshIcon size={24} color="#414755" />
          </Pressable>

          <Pressable
            onPress={onCapture}
            disabled={busy}
            style={({ pressed }) => [
              styles.captureBtn,
              { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
            ]}>
            <LinearGradient colors={['#63656a', '#0b0c0c']} style={styles.captureGradient}>
              <CameraIcon size={32} color="#ffffff" />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={onPickGallery}
            disabled={busy}
            hitSlop={12}
            style={styles.sideBtn}>
            <GalleryIcon size={24} color="#414755" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#000000',
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 32,
    textAlign: 'center',
    paddingTop: 8,
    paddingHorizontal: 48,
  },
  close: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewportArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  viewportContainer: {
    flex: 1,
    width: 342,
    paddingTop: 40,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cameraView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eeeef0',
    borderRadius: 24,
    overflow: 'hidden',
  },
  docImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: '#0058bc',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 31, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 31, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
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
    width: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  sideBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  captureGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
