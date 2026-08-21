/** Central param-list types for React Navigation's typed hooks/props. */

import { Order } from "../types";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProductsStackParamList = {
  ProductList: { initialSearchFocus?: boolean } | undefined;
  ProductDetail: { productId: string };
};

export type ScannedCard = { number: string; expiry: string };

export type CartStackParamList = {
  Cart: undefined;
  // scannedCard is how CardScanScreen hands its (mocked) result back —
  // it navigates here with new params rather than a non-serializable
  // callback prop. See CheckoutScreen's route.params effect.
  Checkout: { scannedCard?: ScannedCard } | undefined;
  CardScan: undefined;
  // The full order (with its snapshotted items) is passed straight through
  // from the create-order response — no need to re-fetch it here, and it
  // keeps OrderConfirmationScreen independent of Phase 9's order-detail hook.
  OrderConfirmation: { order: Order };
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};
