import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { CardScanScreen } from "../features/checkout/screens/CardScanScreen";
import { CheckoutScreen } from "../features/checkout/screens/CheckoutScreen";
import { OrderConfirmationScreen } from "../features/checkout/screens/OrderConfirmationScreen";
import { CartScreen } from "../features/cart/screens/CartScreen";
import { OrderDetailScreen } from "../features/orders/screens/OrderDetailScreen";
import { OrderListScreen } from "../features/orders/screens/OrderListScreen";
import { HomeScreen } from "../features/products/screens/HomeScreen";
import { ProductDetailScreen } from "../features/products/screens/ProductDetailScreen";
import { ProductListScreen } from "../features/products/screens/ProductListScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { colors } from "../theme";
import {
  CartStackParamList,
  MainTabParamList,
  OrdersStackParamList,
  ProductsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

// ProductDetail/Checkout/OrderConfirmation/OrderDetail are pushed as stack
// screens above whichever tab initiated them — keeps the tab bar visible on
// list screens but hidden on detail/flow screens. See ARCHITECTURE_PLAN.md §5.

function HomeStackNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="ProductList" component={HomeScreen} />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: "" }}
      />
    </ProductsStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen
        name="ProductList"
        component={ProductListScreen}
        initialParams={{ initialSearchFocus: true }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: "" }}
      />
    </ProductsStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "Checkout" }} />
      <CartStack.Screen
        name="CardScan"
        component={CardScanScreen}
        options={{ presentation: "modal", headerShown: true, title: "Scan Card" }}
      />
      <CartStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    </CartStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderList" component={OrderListScreen} />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: true, title: "Order" }}
      />
    </OrdersStack.Navigator>
  );
}

// Plain-text tab icons: kept intentionally simple (no icon library dependency)
// per ARCHITECTURE_PLAN.md's "no unnecessary libraries" MVP constraint.
function tabIcon(symbol: string) {
  return ({ color }: { color: string }) => <Text style={{ color, fontSize: 20 }}>{symbol}</Text>;
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Home", tabBarIcon: tabIcon("🏠") }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{ title: "Search", tabBarIcon: tabIcon("🔍") }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{ title: "Cart", tabBarIcon: tabIcon("🛍") }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{ title: "Orders", tabBarIcon: tabIcon("📦") }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile", tabBarIcon: tabIcon("👤") }}
      />
    </Tab.Navigator>
  );
}
