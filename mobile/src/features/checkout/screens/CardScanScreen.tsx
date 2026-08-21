import { CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { CartStackParamList } from "../../../navigation/types";
import { colors, radii, spacing, typography } from "../../../theme";
import { mockCardScanner } from "../lib/cardScanner";

type Props = NativeStackScreenProps<CartStackParamList, "CardScan">;

/**
 * Presented as a modal from CheckoutScreen. Shows a real camera preview
 * (that's the point — it should feel like scanning), but the actual "scan"
 * is mocked: see cardScanner.ts. Whatever the camera sees is never read;
 * after a short delay this just hands back a synthetic, Luhn-valid card by
 * navigating back to Checkout with new params.
 */
export function CardScanScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!permission?.granted || startedRef.current) return;
    startedRef.current = true;
    setScanning(true);
    mockCardScanner.scanCard().then((card) => {
      navigation.navigate({ name: "Checkout", params: { scannedCard: card }, merge: true });
    });
  }, [permission?.granted, navigation]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={[typography.title, styles.permissionTitle]}>Camera access needed</Text>
        <Text style={[typography.body, styles.muted]}>
          To scan a card, allow camera access. You can always enter the details manually instead.
        </Text>
        <Button title="Enter manually" variant="outline" onPress={() => navigation.goBack()} style={styles.manualLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.cardGuide} />
        <Text style={[typography.body, styles.instructions]}>
          {scanning ? "Hold your card inside the frame..." : "Position your card here"}
        </Text>
      </View>
      <Button
        title="Enter manually instead"
        variant="outline"
        onPress={() => navigation.goBack()}
        style={styles.manualDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  cardGuide: {
    width: "85%",
    aspectRatio: 1.586, // standard payment-card ratio
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.white,
  },
  instructions: { color: colors.white, marginTop: spacing.lg, textAlign: "center" },
  permissionTitle: { color: colors.white, textAlign: "center" },
  muted: { color: colors.textMuted, marginTop: spacing.sm, textAlign: "center" },
  manualLight: { marginTop: spacing.xl, borderColor: colors.white },
  manualDark: { position: "absolute", bottom: spacing.xxl, alignSelf: "center", backgroundColor: colors.black, borderColor: colors.white },
});
