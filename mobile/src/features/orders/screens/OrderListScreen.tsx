import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Screen } from "../../../components/Screen";
import { Skeleton } from "../../../components/Skeleton";
import { apiErrorMessage } from "../../../lib/errors";
import { OrdersStackParamList } from "../../../navigation/types";
import { spacing, typography } from "../../../theme";
import { OrderListItem } from "../components/OrderListItem";
import { useOrders } from "../hooks/useOrders";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderList">;

export function OrderListScreen({ navigation }: Props) {
  const ordersQuery = useOrders();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.displaySmall}>Orders</Text>
      </View>

      {ordersQuery.isPending ? (
        <View style={styles.padded}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={92} style={{ marginBottom: spacing.md }} />
          ))}
        </View>
      ) : ordersQuery.isError ? (
        <ErrorState message={apiErrorMessage(ordersQuery.error)} onRetry={() => ordersQuery.refetch()} />
      ) : ordersQuery.data.orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Once you place an order, you'll see it here."
          actionLabel="Browse products"
          onAction={() => navigation.getParent()?.navigate("HomeTab" as never)}
        />
      ) : (
        <FlatList
          data={ordersQuery.data.orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OrderListItem order={item} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  padded: { paddingHorizontal: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
