import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold,
  useFonts,
} from "@expo-google-fonts/playfair-display";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "./src/components/Toast";
import { queryClient } from "./src/lib/queryClient";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/state/authStore";
import { colors } from "./src/theme";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  // Loaded once at the root rather than per-screen — the Shop hero's serif
  // headline (theme/typography.ts heroTitle/heroSubtitle) depends on this
  // being ready before it renders, otherwise it flashes the system font for
  // one frame.
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_400Regular_Italic,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
