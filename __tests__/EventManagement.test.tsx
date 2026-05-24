import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import CreateEvent from "../screens/organizer/CreateEvent";
import EventDetailScreen from "../screens/organizer/EventDetailScreen";
import MemberList from "../screens/organizer/MemberList";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../services/eventService", () => ({
  eventService: {
    createEvent: jest.fn(),
    getEventDetail: jest.fn().mockResolvedValue({ data: { name: "Test Event", members: [] } }),
    getEventProgress: jest.fn().mockResolvedValue({ data: { percentage: 50 } }),
  },
}));

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

describe("Event Management Simple Tests", () => {
  it("1. CreateEvent render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <CreateEvent navigation={mockNav} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. EventDetailScreen render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <EventDetailScreen navigation={mockNav} route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("3. MemberList render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});