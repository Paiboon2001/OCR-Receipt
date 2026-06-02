import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { MaximizeIcon, QrCodeIcon } from '../components/CoverIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const PRIMARY = '#0485f7';

function CheckMark({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const onLogin = () => navigation.replace('Cover');

  return (
    <LinearGradient colors={['#ffffff', '#d0eeff']} locations={[0, 1]} style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Scan icon */}
          <View style={styles.scanIconStack}>
            <MaximizeIcon size={120} color={PRIMARY} />
            <View style={styles.qrOverlay}>
              <QrCodeIcon size={72} color={PRIMARY} />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log in OCR Receipt</Text>
            <Text style={styles.subtitle}>กรุณาเข้าสู่ระบบ</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="ชื่อผู้ใช้งาน"
              placeholderTextColor="#798aa3"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="รหัสผ่าน"
              placeholderTextColor="#798aa3"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            {/* Remember me */}
            <Pressable
              onPress={() => setRemember(r => !r)}
              style={styles.checkboxRow}
              hitSlop={6}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && <CheckMark size={12} />}
              </View>
              <Text style={styles.checkboxLabel}>จดจำผู้ใช้งาน</Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              onPress={onLogin}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}>
              <LinearGradient colors={['#606267', '#0d0d0e']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
              </LinearGradient>
            </Pressable>

            {/* Secure pill */}
            <View style={styles.securePill}>
              <Text style={styles.secureText}>
                การเชื่อมต่อปลอดภัย เข้ารหัสแบบ End- to End
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 32,
  },
  scanIconStack: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrOverlay: { position: 'absolute' },
  header: { alignItems: 'center', gap: 8 },
  title: {
    fontFamily: SERIF,
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1c1e',
    letterSpacing: -0.72,
    lineHeight: 44,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    lineHeight: 24,
    textAlign: 'center',
  },
  form: { width: 354, maxWidth: '100%', gap: 24 },
  input: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(9,114,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1d212d',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#798aa3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1d212d',
    letterSpacing: -0.154,
  },
  button: {
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: -0.22,
    textAlign: 'center',
  },
  securePill: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9fcbff',
    borderRadius: 9999,
    paddingHorizontal: 17,
    paddingVertical: 7,
  },
  secureText: {
    fontSize: 12,
    color: '#414755',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
