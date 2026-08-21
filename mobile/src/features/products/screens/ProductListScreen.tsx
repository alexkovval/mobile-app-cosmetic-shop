import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Screen } from "../../../components/Screen";
import { ProductGridSkeleton } from "../../../components/Skeleton";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { apiErrorMessage } from "../../../lib/errors";
import { ProductsStackParamList } from "../../../navigation/types";
import { spacing, typography } from "../../../theme";
import { CategoryChipRow } from "../components/CategoryChipRow";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";

type Props = NativeStackScreenProps<ProductsStackParamList, "ProductList">;

const PAGE_SIZE = 20;

/**
 * The Search tab's screen — search field, category chips, and the product
 * grid. Home's landing page (HomeScreen.tsx) deliberately doesn't duplicate
 * this; browsing lives in exactly one place.
 */
export function ProductListScreen({ route, navigation }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const listRef = useRef<FlatList>(null);

  // A new search/category resets pagination — otherwise "load more" state
  // from the previous filter would leak into the new one.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [debouncedSearch, category]);

  // Belt-and-suspenders alongside the `key` remount below: force the list
  // back to the top imperatively too, in case a remount alone doesn't clear
  // a stale scroll offset (this is what was showing as empty space between
  // the category row and the first product row).
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [category, debouncedSearch]);

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    search: debouncedSearch || undefined,
    category,
    page: 1,
    limit,
  });

  const items = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const canLoadMore = items.length < total;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.displaySmall}>Search</Text>
      </View>

      <SearchBar value={searchInput} onChangeText={setSearchInput} autoFocus={route.params?.initialSearchFocus} />
      <CategoryChipRow categories={categoriesQuery.data?.categories ?? []} selected={category} onSelect={setCategory} />

      {productsQuery.isPending ? (
        <ProductGridSkeleton />
      ) : productsQuery.isError ? (
        <ErrorState message={apiErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          message={debouncedSearch || category ? "Try a different search or category." : "Check back soon."}
        />
      ) : (
        <FlatList
          // Remounts the list whenever the filter changes, so it starts
          // scrolled to the top. Without this, switching categories kept
          // whatever scroll offset was left over from the previous (often
          // longer) list, which showed as blank space above the first row
          // of the new, shorter list — not a spacing/padding bug at all.
          key={`${category ?? "all"}-${debouncedSearch}`}
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.column}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })} />
          )}
          ListFooterComponent={
            canLoadMore ? (
              <Button
                title={productsQuery.isFetching ? "Loading..." : "Load more"}
                variant="outline"
                disabled={productsQuery.isFetching}
                onPress={() => setLimit((l) => l + PAGE_SIZE)}
                style={styles.loadMore}
              />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xs },
  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  column: { justifyContent: "space-between"},
  loadMore: { marginTop: spacing.sm, marginBottom: spacing.lg },
});
