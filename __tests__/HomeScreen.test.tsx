import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen";

jest.mock("@expo/vector-icons", () => ({ Ionicons: "View" }));
jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement(View, null, children),
    Circle: () => null,
  };
});

describe("HomeScreen", () => {
  it("1. Màn hình render thành công không bị crash", () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị thông tin người dùng và Banner", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Hello Mobile")).toBeTruthy();
    expect(getByText("85%")).toBeTruthy();
    expect(getByText("Hỗ trợ gian hàng số 14")).toBeTruthy();
  });

  it("3. Xử lý nút bấm Xem nhiệm vụ", () => {
    const mockNav = { navigate: jest.fn() };
    const { getByTestId } = render(<HomeScreen navigation={mockNav} />);
    const button = getByTestId("btn-action");

    expect(getByTestId("btn-action")).toBeTruthy();
    fireEvent.press(button);
    expect(mockNav.navigate).toHaveBeenCalledWith("Calendar");
  });
});
