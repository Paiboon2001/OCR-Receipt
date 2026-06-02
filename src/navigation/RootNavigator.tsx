import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList } from './types';
import { colors, typography } from '../theme/theme';
import { Icon, IconName } from '../components/Icon';

import CoverScreen from '../screens/CoverScreen';
import QrLoginScreen from '../screens/QrLoginScreen';
import ScanDocsScreen from '../screens/ScanDocsScreen';
import ScanScreen from '../screens/ScanScreen';
import ReceiptListScreen from '../screens/ReceiptListScreen';
import SummaryScreen from '../screens/SummaryScreen';
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabBarIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <Icon
      name={name}
      size={22}
      style={{ opacity: focused ? 1 : 0.45 }}
    />
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={[
        styles.tabLabel,
        { color: focused ? colors.primary : colors.textMuted },
      ]}>
      {label}
    </Text>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { paddingTop: 6 },
      }}>
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="scan" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Scan" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="list" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Receipts" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="chart" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Summary" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Cover">
        <Stack.Screen
          name="Cover"
          component={CoverScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrLogin"
          component={QrLoginScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ScanDocs"
          component={ScanDocsScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReceiptDetail"
          component={ReceiptDetailScreen}
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabLabel: {
    ...typography.label,
    fontSize: 11,
  },
});
