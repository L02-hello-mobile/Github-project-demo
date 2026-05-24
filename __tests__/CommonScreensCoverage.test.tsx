import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

// Mock Sentry
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  Native: { captureException: jest.fn(), captureMessage: jest.fn() },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock lucide-react-native
jest.mock("lucide-react-native", () => {
  const MockIcon = () => null;
  return {
    Lock: MockIcon, LogOut: MockIcon, Bell: MockIcon, AlarmClock: MockIcon,
    CheckCircle2: MockIcon, Globe: MockIcon, Info: MockIcon, FileText: MockIcon,
    ChevronRight: MockIcon, MapPin: MockIcon, Plus: MockIcon,
  };
});

// Mock services
jest.mock("../services/authService", () => ({
  authService: { login: jest.fn(), register: jest.fn(), forgotPassword: jest.fn() },
}));

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getNotifications: jest.fn().mockResolvedValue({ data: [] }),
    markAllRead: jest.fn(),
    deleteNotification: jest.fn(),
    getSettings: jest.fn().mockResolvedValue({ data: {} }),
    updateSettings: jest.fn(),
  },
}));

jest.mock("../services/socketService", () => ({
  socketService: { connect: jest.fn(), disconnect: jest.fn() },
}));

jest.mock("../services/uploadService", () => ({
  uploadService: { uploadImage: jest.fn().mockResolvedValue({ data: { imageUrl: "" } }) },
}));

jest.mock("../context/SocketNotificationContext", () => ({
  useSocketNotification: () => ({ unreadCount: 0, markAsRead: jest.fn(), refreshUnreadCount: jest.fn() }),
}));

// Import screens
import AccountScreen from "../screens/common/AccountScreen";
import ForgotPasswordScreen from "../screens/common/ForgotPasswordScreen";
import HomeScreen from "../screens/common/HomeScreen";
import LoginScreen from "../screens/common/LoginScreen";
import NotificationScreen from "../screens/common/NotificationScreen";
import OnboardingScreen from "../screens/common/OnboardingScreen";
import ResetPasswordScreen from "../screens/common/ResetPasswordScreen";
import SettingScreen from "../screens/common/SettingScreen";
import SignUpScreen from "../screens/common/SignUpScreen";
import StartScreen from "../screens/common/StartScreen";
import WalkthroughScreen from "../screens/common/WalkthroughScreen";

const mockNav = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };

describe("Common Screens - Simple & Stable Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("AccountScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><AccountScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("ForgotPasswordScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><ForgotPasswordScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("HomeScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><HomeScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("LoginScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><LoginScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("NotificationScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><NotificationScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("OnboardingScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><OnboardingScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("ResetPasswordScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><ResetPasswordScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("SettingScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><SettingScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("SignUpScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><SignUpScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("StartScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><StartScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });

  it("WalkthroughScreen renders", () => {
    const { toJSON } = render(<NavigationContainer><WalkthroughScreen navigation={mockNav} /></NavigationContainer>);
    expect(toJSON()).toBeTruthy();
  });
});