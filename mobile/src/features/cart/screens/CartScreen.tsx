import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Screen } from "../../../components/Screen";
import { Skeleton } from "../../../components/Skeleton";
import { apiErrorMessage } from "../../../lib/errors";
import { CartStackParamList } from "../../../navigation/types";
import { spacing, typography } from "../../../theme";
import { CartLineItem } from "../components/CartLineItem";
import { CartSummary } from "../components/CartSummary";
import { useCart } from "../hooks/useCart";
import { useRemoveCartItem } from "../hooks/useRemoveCartItem";
import { useUpdateCartItem } from "../hooks/useUpdateCartItem";

type Props = NativeStackScreenProps<CartStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const cartQuery = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (cartQuery.isPending) {
    return (
      <Screen style={styles.padded}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={72} style={{ marginBottom: spacing.md }} />
        ))}
      </Screen>
    );
  }

  if (cartQuery.isError) {
    return (
      <Screen>
        <ErrorState message={apiErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />
      </Screen>
    );
  }

  const { items, subtotal } = cartQuery.data;

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Your cart is empty"
          message="Browse products and add something you love."
          actionLabel="Browse products"
          onAction={() => navigation.getParent()?.navigate("HomeTab" as never)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={[typography.displaySmall, styles.header]}>Cart</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const busy =
            (updateItem.isPending && updateItem.variables?.itemId === item.id) ||
            (removeItem.isPending && removeItem.variables === item.id);
          return (
            <CartLineItem
              item={item}
              busy={busy}
              onIncrement={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
              onDecrement={() => {
                // Decrementing below 1 removes the line — a common,
                // low-friction pattern that avoids a separate confirm step
                // for the common "changed my mind" case.
                if (item.quantity <= 1) {
                  removeItem.mutate(item.id);
                } else {
                  updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                }
              }}
              onRemove={() => removeItem.mutate(item.id)}
            />
          );
        }}
      />
      <CartSummary subtotal={subtotal} onCheckout={() => navigation.navigate("Checkout")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg },
});
