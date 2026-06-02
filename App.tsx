/**
 * OCR Receipt — mobile app entry.
 * Wraps the navigator with safe-area + receipt store providers.
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { ReceiptProvider } from './src/storage/receiptStore';
import { colors } from './src/theme/theme';

function App() {
  return (
    <SafeAreaProvider>
      <ReceiptProvider>
        <View style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
          <RootNavigator />
        </View>
      </ReceiptProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});

export default App;
