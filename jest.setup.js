/* eslint-disable no-undef */
import "@testing-library/react-native";

global.__expo_module_name = "test";

jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "View",
}));

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Stub = ({ children }: any) => React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Stub,
    Svg: Stub,
    Circle: () => null,
    Path: () => null,
    G: Stub,
    Defs: Stub,
    ClipPath: Stub,
    Rect: () => null,
    Line: () => null,
    Polyline: () => null,
    Polygon: () => null,
    Ellipse: () => null,
    Text: () => null,
  };
});

// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
