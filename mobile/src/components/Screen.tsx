import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

/**
 * Root container for any screen whose stack has `headerShown: false`
 * (Products, Search, Cart, Orders, Profile, Order Confirmation — see
 * MainTabNavigator.tsx). Without this, content starts at y=0 and renders
 * underneath the status bar / notch, since there's no native header to push
 * it down. Screens that keep the native header (ProductDetail, Checkout,
 * CardScan, OrderDetail) get safe-area handling for free from React
 * Navigation and don't need this wrapper.
 */
export function Screen({ children, edges = ["top"], style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.base, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: colors.background },
});
