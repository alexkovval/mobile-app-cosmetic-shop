import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../state/authStore";
import { colors } from "../theme";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

/**
 * Switches between the unauthenticated and authenticated navigators based on
 * session presence in authStore. See ARCHITECTURE_PLAN.md §5.
 */
export function RootNavigator() {
  const { token, isHydrating } = useAuthStore();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <NavigationContainer>{token ? <MainTabNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
