import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders the given message", () => {
    const { getByText } = render(<ErrorState message="Couldn't reach the server." />);
    expect(getByText("Couldn't reach the server.")).toBeTruthy();
  });

  it("fires onRetry when Retry is pressed", () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorState message="Something broke" onRetry={onRetry} />);
    fireEvent.press(getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders no retry button when onRetry isn't provided", () => {
    const { queryByText } = render(<ErrorState message="Something broke" />);
    expect(queryByText("Retry")).toBeNull();
  });
});
