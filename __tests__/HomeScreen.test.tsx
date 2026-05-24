import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/common/HomeScreen";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
}));

jest.mock("../services/eventService", () => ({
  eventService: { getMyEvents: jest.fn().mockResolvedValue({ success: true, data: [] }) },
}));

describe("HomeScreen", () => {
  it("1. Render thành công", async () => {
    const { toJSON } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị fallback khi chưa có user", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    await waitFor(() => expect(getByText("Người dùng")).toBeTruthy());
  });
});