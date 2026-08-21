import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the title and optional message", () => {
    const { getByText } = render(<EmptyState title="No products found" message="Try a different search." />);
    expect(getByText("No products found")).toBeTruthy();
    expect(getByText("Try a different search.")).toBeTruthy();
  });

  it("fires onAction when the action button is pressed", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState title="Your cart is empty" actionLabel="Browse products" onAction={onAction} />
    );
    fireEvent.press(getByText("Browse products"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders no action button when actionLabel/onAction aren't provided", () => {
    const { queryByText } = render(<EmptyState title="Your cart is empty" />);
    expect(queryByText("Browse products")).toBeNull();
  });
});
