import React from 'react';
import { Text, TextStyle } from 'react-native';

/**
 * Lightweight emoji-glyph icon. Keeps the project runnable with zero native
 * font linking. Swap this single component for react-native-vector-icons later
 * without touching call sites if you prefer outline icons.
 */
const GLYPHS = {
  scan: '📷',
  list: '🧾',
  chart: '📊',
  back: '‹',
  close: '✕',
  check: '✓',
  edit: '✎',
  trash: '🗑️',
  gallery: '🖼️',
  plus: '＋',
  calendar: '📅',
  search: '🔍',
  chevron: '›',
  sparkle: '✨',
  warning: '⚠️',
} as const;

export type IconName = keyof typeof GLYPHS;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const Icon: React.FC<Props> = ({ name, size = 20, color, style }) => (
  <Text
    allowFontScaling={false}
    style={[{ fontSize: size, lineHeight: size + 2, color }, style]}>
    {GLYPHS[name]}
  </Text>
);
