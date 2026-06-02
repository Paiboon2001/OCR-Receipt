import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Card } from '../components/ui';
import { Icon } from '../components/Icon';
import { scanReceipt } from '../services/ocr';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Scan'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ScanScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  async function handleAsset(asset: Asset | undefined) {
    if (!asset?.base64) {
      Alert.alert('Could not read image', 'Please try a different photo.');
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
    } catch (e) {
      Alert.alert('Scan failed', 'The OCR service could not read this receipt.');
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
      Alert.alert('Camera unavailable', res.errorMessage ?? res.errorCode);
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
      Alert.alert('Gallery unavailable', res.errorMessage ?? res.errorCode);
      return;
    }
    handleAsset(res.assets?.[0]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>OCR RECEIPT</Text>
        <Text style={styles.title}>Scan a receipt</Text>
        <Text style={styles.subtitle}>
          Snap a photo and we’ll extract the merchant, items and totals
          automatically.
        </Text>

        {/* Capture frame */}
        <View style={styles.frame}>
          <View style={styles.frameInner}>
            <Icon name="scan" size={56} />
            <Text style={styles.frameText}>
              {busy ? 'Reading your receipt…' : 'Position the receipt in frame'}
            </Text>
            {busy && (
              <View style={styles.busyBar}>
                <View style={styles.busyFill} />
              </View>
            )}
          </View>
          {/* Decorative corner guides */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <Pressable
          onPress={onCapture}
          disabled={busy}
          style={({ pressed }) => [
            styles.captureBtn,
            { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
          ]}>
          <Icon name="scan" size={22} color={colors.textInverse} />
          <Text style={styles.captureText}>Capture receipt</Text>
        </Pressable>

        <Pressable
          onPress={onPickGallery}
          disabled={busy}
          style={({ pressed }) => [
            styles.galleryBtn,
            { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
          ]}>
          <Icon name="gallery" size={20} />
          <Text style={styles.galleryText}>Choose from gallery</Text>
        </Pressable>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tips for a clean scan</Text>
          {[
            'Lay the receipt flat on a dark surface',
            'Avoid glare and harsh shadows',
            'Include the merchant name and total',
          ].map(tip => (
            <View key={tip} style={styles.tipRow}>
              <Icon name="check" size={14} color={colors.success} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  kicker: { ...typography.label, color: colors.primary },
  title: { ...typography.display, color: colors.text, marginTop: spacing.xs },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  frame: {
    height: 280,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  frameInner: { alignItems: 'center', paddingHorizontal: spacing.lg },
  frameText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  busyBar: {
    width: 160,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  busyFill: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.primary,
  },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.md,
    marginTop: spacing.xl,
  },
  captureText: { ...typography.heading, color: colors.textInverse },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryText: { ...typography.bodyStrong, color: colors.text },
  tipCard: { marginTop: spacing.xl },
  tipTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  tipText: { ...typography.body, color: colors.textSecondary, flex: 1 },
});
