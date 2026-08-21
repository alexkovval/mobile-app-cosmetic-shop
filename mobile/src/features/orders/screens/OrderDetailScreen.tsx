import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";
import { formatDate } from "../../../lib/formatDate";
import { apiErrorMessage } from "../../../lib/errors";
import { formatCents } from "../../../lib/money";
import { OrdersStackParamList } from "../../../navigation/types";
import { colors, radii, spacing, typography } from "../../../theme";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useOrder } from "../hooks/useOrder";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

export function OrderDetailScreen({ route }: Props) {
  const orderQuery = useOrder(route.params.orderId);

  if (orderQuery.isPending) {
    return (
      <View style={styles.container}>
        <Skeleton height={160} style={{ marginBottom: spacing.md }} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (orderQuery.isError) {
    return (
      <View style={styles.container}>
        <ErrorState message={apiErrorMessage(orderQuery.error)} onRetry={() => orderQuery.refetch()} />
      </View>
    );
  }

  const { order } = orderQuery.data;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={typography.title}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={[typography.caption, styles.date]}>{formatDate(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.card}>
        <Text style={[typography.subtitle, styles.sectionTitle]}>Items</Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={[typography.body, styles.itemName]} numberOfLines={1}>
              {item.quantity}× {item.nameSnapshot}
            </Text>
            <Text style={typography.body}>{formatCents(item.priceSnapshot * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={[typography.subtitle, styles.sectionTitle]}>Summary</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  date: { color: colors.textMuted, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: { marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { flex: 1, marginRight: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
