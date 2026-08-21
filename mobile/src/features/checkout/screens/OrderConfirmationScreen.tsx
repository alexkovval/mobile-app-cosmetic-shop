import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { Screen } from "../../../components/Screen";
import { formatCents } from "../../../lib/money";
import { CartStackParamList } from "../../../navigation/types";
import { colors, radii, spacing, typography } from "../../../theme";

type Props = NativeStackScreenProps<CartStackParamList, "OrderConfirmation">;

// The order (with its snapshotted line items) comes straight from the
// create-order response — see navigation/types.ts — so this screen needs no
// query of its own and has nothing to load/error/retry.
export function OrderConfirmationScreen({ route, navigation }: Props) {
  const { order } = route.params;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>✓</Text>
        </View>
        <Text style={[typography.displaySmall, styles.title]}>Order placed!</Text>
        <Text style={[typography.body, styles.subtitle]}>Thanks — here's your confirmation.</Text>

        <View style={styles.card}>
          <Text style={[typography.caption, styles.orderId]}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>

          {order.items?.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={[typography.body, styles.itemName]} numberOfLines={1}>
                {item.quantity}× {item.nameSnapshot}
              </Text>
              <Text style={typography.body}>{formatCents(item.priceSnapshot * item.quantity)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={typography.body}>Subtotal</Text>
            <Text style={typography.body}>{formatCents(order.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={typography.body}>Tax</Text>
            <Text style={typography.body}>{formatCents(order.tax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={typography.body}>Shipping</Text>
            <Text style={typography.body}>{formatCents(order.shipping)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={typography.subtitle}>Total</Text>
            <Text style={typography.subtitle}>{formatCents(order.total)}</Text>
          </View>
        </View>

        <Button
          title="Back to shopping"
          onPress={() => navigation.getParent()?.navigate("HomeTab" as never)}
          style={styles.cta}
        />
        <Button
          title="View order history"
          variant="outline"
          onPress={() => navigation.getParent()?.navigate("OrdersTab" as never)}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, alignItems: "center" },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  badgeIcon: { fontSize: 28, color: colors.success },
  title: { marginTop: spacing.lg, textAlign: "center" },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, textAlign: "center" },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  orderId: { color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { flex: 1, marginRight: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  cta: { width: "100%", marginTop: spacing.md },
});
