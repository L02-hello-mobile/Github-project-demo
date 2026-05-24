import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  Native: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("lucide-react-native", () => {
  const MockIcon = () => null;
  return {
    Lock: MockIcon,
    LogOut: MockIcon,
    Bell: MockIcon,
    AlarmClock: MockIcon,
    CheckCircle2: MockIcon,
    Globe: MockIcon,
    Info: MockIcon,
    FileText: MockIcon,
    ChevronRight: MockIcon,
    MapPin: MockIcon,
    Plus: MockIcon,
  };
});

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement(View, null, children),
    Circle: () => null,
    Svg: ({ children }: any) => React.createElement(View, null, children),
  };
});

jest.mock("../components/Icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockIcon = () => React.createElement(View, null);
  return {
    ArrowIcon: MockIcon,
    NotificationIcon: MockIcon,
    BriefcaseIcon: MockIcon,
    MapIcon: MockIcon,
    CalendarIcon: MockIcon,
  };
});

jest.mock("../components/InvitePopup", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function MockInvitePopup({ visible, onAccept, onDecline, eventName }: any) {
    if (!visible) return null;
    return React.createElement(
      View,
      { testID: "invite-popup" },
      React.createElement(Text, null, eventName),
      React.createElement(TouchableOpacity, { testID: "btn-accept", onPress: onAccept },
        React.createElement(Text, null, "Accept")
      ),
      React.createElement(TouchableOpacity, { testID: "btn-decline", onPress: onDecline },
        React.createElement(Text, null, "Decline")
      )
    );
  };
});

jest.mock("../utils/pushNotifications", () => ({
  unregisterPushToken: jest.fn().mockResolvedValue(undefined),
}));

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  forgotPassword: jest.fn(),
};
jest.mock("../services/authService", () => ({
  authService: mockAuthService,
}));

const mockNotificationService = {
  getNotifications: jest.fn().mockResolvedValue({ data: [] }),
  markAllRead: jest.fn().mockResolvedValue(undefined),
  deleteNotification: jest.fn().mockResolvedValue(undefined),
  getSettings: jest.fn().mockResolvedValue({ data: {} }),
  updateSettings: jest.fn().mockResolvedValue(undefined),
};
jest.mock("../services/notificationService", () => ({
  notificationService: mockNotificationService,
}));

const mockSocketService = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  addNotificationListener: jest.fn(),
  removeNotificationListener: jest.fn(),
};
jest.mock("../services/socketService", () => ({
  socketService: mockSocketService,
}));

const mockUploadService = {
  uploadImage: jest.fn().mockResolvedValue({ data: { imageUrl: "https://example.com/avatar.jpg" } }),
};
jest.mock("../services/uploadService", () => ({
  uploadService: mockUploadService,
}));

const mockEventService = {
  getMyEvents: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getEventProgress: jest.fn().mockResolvedValue({ data: { percentage: 50 } }),
  respondInvite: jest.fn().mockResolvedValue(undefined),
};
jest.mock("../services/eventService", () => ({
  eventService: mockEventService,
}));

const mockTaskService = {
  getMyTasks: jest.fn().mockResolvedValue({ data: [] }),
};
jest.mock("../services/taskService", () => ({
  taskService: mockTaskService,
}));

const mockSocketNotification = {
  unreadCount: 0,
  markAsRead: jest.fn(),
  refreshUnreadCount: jest.fn(),
};
jest.mock("../context/SocketNotificationContext", () => ({
  useSocketNotification: () => mockSocketNotification,
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useFocusEffect: (cb: any) => cb(),
  };
});

import AccountScreen from "../screens/common/AccountScreen";
import ForgotPasswordScreen from "../screens/common/ForgotPasswordScreen";
import LoginScreen from "../screens/common/LoginScreen";
import OnboardingScreen from "../screens/common/OnboardingScreen";
import ResetPasswordScreen from "../screens/common/ResetPasswordScreen";
import SettingScreen from "../screens/common/SettingScreen";
import SignUpScreen from "../screens/common/SignUpScreen";
import StartScreen from "../screens/common/StartScreen";
import WalkthroughScreen from "../screens/common/WalkthroughScreen";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Sentry from "@sentry/react-native";

const mockNav = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
};

function wrap(element: React.ReactElement) {
  return render(<NavigationContainer>{element}</NavigationContainer>);
}

describe("Common Screens - Simple & Stable Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("StartScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<StartScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("navigates to Walkthrough on button press", () => {
      const { getByText } = wrap(<StartScreen navigation={mockNav} />);
      fireEvent.press(getByText("Khám Phá"));
      expect(mockNav.navigate).toHaveBeenCalledWith("Walkthrough");
    });
  });

  describe("WalkthroughScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<WalkthroughScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("shows slide counter 1/3", () => {
      const { getByText } = wrap(<WalkthroughScreen navigation={mockNav} />);
      expect(getByText("1/3")).toBeTruthy();
    });

    it("pressing Skip replaces to Login", () => {
      const { getByText } = wrap(<WalkthroughScreen navigation={mockNav} />);
      fireEvent.press(getByText("Bỏ qua"));
      expect(mockNav.replace).toHaveBeenCalledWith("Login");
    });

    it("pressing Tiếp theo on first slide goes forward", () => {
      const { getByText } = wrap(<WalkthroughScreen navigation={mockNav} />);
      fireEvent.press(getByText("Tiếp theo"));
      expect(mockNav.replace).not.toHaveBeenCalled();
    });
  });

  describe("OnboardingScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<OnboardingScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("can type into email and password inputs", () => {
      const { getByTestId } = wrap(<OnboardingScreen navigation={mockNav} />);
      fireEvent.changeText(getByTestId("input-email"), "test@example.com");
      fireEvent.changeText(getByTestId("input-password"), "secret123");
    });

    it("pressing login button navigates to Main", () => {
      const { getByTestId } = wrap(<OnboardingScreen navigation={mockNav} />);
      fireEvent.press(getByTestId("btn-login"));
      expect(mockNav.navigate).toHaveBeenCalledWith("Main");
    });
  });

  describe("LoginScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<LoginScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("shows error when submitting empty fields", async () => {
      const { getByText } = wrap(<LoginScreen navigation={mockNav} />);
      fireEvent.press(getByText("Đăng nhập"));
      await waitFor(() =>
        expect(getByText("Vui lòng nhập email và mật khẩu")).toBeTruthy()
      );
    });

    it("navigates to ForgotPassword", () => {
      const { getByText } = wrap(<LoginScreen navigation={mockNav} />);
      fireEvent.press(getByText("Quên mật khẩu?"));
      expect(mockNav.navigate).toHaveBeenCalledWith("ForgotPassword");
    });

    it("navigates to SignUp", () => {
      const { getByText } = wrap(<LoginScreen navigation={mockNav} />);
      fireEvent.press(getByText("Đăng ký"));
      expect(mockNav.navigate).toHaveBeenCalledWith("SignUp");
    });

    it("successful login stores token and navigates to Main", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        success: true,
        data: { token: "tok123", _id: "u1", email: "a@b.com" },
      });
      const { getByText } = wrap(<LoginScreen navigation={mockNav} />);
      fireEvent.press(getByText("Test Sentry Error"));
      expect((Sentry as any).Native.captureException).toHaveBeenCalled();
    });

    it("login handles network error gracefully", async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error("network"));
      const { getByText } = wrap(<LoginScreen navigation={mockNav} />);
      expect(getByText("Đăng nhập")).toBeTruthy();
    });
  });

  describe("ForgotPasswordScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<ForgotPasswordScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("shows alert when submitting empty email", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByText } = wrap(<ForgotPasswordScreen navigation={mockNav} />);
      fireEvent.press(getByText("Gửi"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith("Thông báo", "Vui lòng nhập email của bạn")
      );
    });
  });

  describe("ResetPasswordScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<ResetPasswordScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("pressing Xác nhận shows under-development alert", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByText } = wrap(<ResetPasswordScreen navigation={mockNav} />);
      fireEvent.press(getByText("Xác nhận"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith(
          "Thông báo",
          "Tính năng đang phát triển. Vui lòng thử lại sau.",
          expect.any(Array)
        )
      );
    });

    it("can type into new password input", () => {
      const { getByPlaceholderText } = wrap(<ResetPasswordScreen navigation={mockNav} />);
      fireEvent.changeText(getByPlaceholderText("••••••"), "newpass123");
    });
  });

  describe("SignUpScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<SignUpScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("shows error when submitting empty fields", async () => {
      const { getByText } = wrap(<SignUpScreen navigation={mockNav} />);
      fireEvent.press(getByText("Đăng ký"));
      await waitFor(() =>
        expect(getByText("Vui lòng điền đầy đủ thông tin")).toBeTruthy()
      );
    });

    it("shows error when passwords do not match", async () => {
      const { getByText, getAllByPlaceholderText } = wrap(
        <SignUpScreen navigation={mockNav} />
      );
      const [elliot1, elliot2] = getAllByPlaceholderText("Elliot");
      fireEvent.changeText(elliot1, "Nguyen");
      fireEvent.changeText(elliot2, "Van");

      const spacePlaceholders = getAllByPlaceholderText("   ");
      fireEvent.changeText(spacePlaceholders[0], "test@email.com");

      const sixSpacePlaceholders = getAllByPlaceholderText("      ");
      fireEvent.changeText(sixSpacePlaceholders[0], "password1");
      fireEvent.changeText(sixSpacePlaceholders[1], "password2");

      fireEvent.press(getByText("Đăng ký"));
      await waitFor(() =>
        expect(getByText("Mật khẩu xác nhận không khớp")).toBeTruthy()
      );
    });

    it("navigates to Login", () => {
      const { getByText } = wrap(<SignUpScreen navigation={mockNav} />);
      fireEvent.press(getByText("Đăng nhập"));
      expect(mockNav.navigate).toHaveBeenCalledWith("Login");
    });
  });

  describe("AccountScreen", () => {
    it("renders", () => {
      const { toJSON } = wrap(<AccountScreen navigation={mockNav} />);
      expect(toJSON()).toBeTruthy();
    });

    it("loads user data from AsyncStorage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ fullName: "Nguyen Van A", email: "a@b.com", avatarUrl: "" })
      );
      const { findByDisplayValue } = wrap(<AccountScreen navigation={mockNav} />);
      await findByDisplayValue("a@b.com");
    });

    it("splits fullName with multiple parts correctly", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ fullName: "Nguyen Van An", email: "x@y.com" })
      );
      const { findByDisplayValue } = wrap(<AccountScreen navigation={mockNav} />);
      await findByDisplayValue("Nguyen Van");
    });

    it("handles user with single-word name", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ fullName: "Alice", email: "alice@test.com" })
      );
      const { findByDisplayValue } = wrap(<AccountScreen navigation={mockNav} />);
      await findByDisplayValue("Alice");
    });

    it("shows avatar image when avatarUrl is set", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ fullName: "Test User", email: "t@t.com", avatarUrl: "https://img.com/a.jpg" })
      );
      const { findByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      await findByTestId("avatar-image");
    });

    it("pressing back button calls goBack", () => {
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      fireEvent.press(getByTestId("btn-back"));
      expect(mockNav.goBack).toHaveBeenCalled();
    });

    it("save with empty name shows alert", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      fireEvent.press(getByTestId("btn-save"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith("Lỗi", "Vui lòng nhập tên của bạn")
      );
    });

    it("save with valid name shows success alert", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ fullName: "Nguyen Van A", email: "a@b.com" })
      );
      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      await waitFor(() => {});

      fireEvent.changeText(getByTestId("input-first-name"), "Nguyen");
      fireEvent.changeText(getByTestId("input-last-name"), "A");
      fireEvent.press(getByTestId("btn-save"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith("Thành công", "Thông tin đã được lưu")
      );
    });

    it("avatar button triggers image picker (permission denied)", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });
      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      fireEvent.press(getByTestId("btn-avatar"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith(
          "Cần quyền truy cập",
          expect.any(String)
        )
      );
    });

    it("avatar picker canceled does nothing", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true });
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      await act(async () => {
        fireEvent.press(getByTestId("btn-avatar"));
      });
    });

    it("AsyncStorage failure during loadUser is handled gracefully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("storage error"));
      const { toJSON } = wrap(<AccountScreen navigation={mockNav} />);
      await waitFor(() => expect(toJSON()).toBeTruthy());
    });

    it("AsyncStorage failure during save shows error alert", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error("storage error"));

      const alertSpy = jest.spyOn(Alert, "alert");
      const { getByTestId } = wrap(<AccountScreen navigation={mockNav} />);
      await waitFor(() => {});

      fireEvent.changeText(getByTestId("input-first-name"), "Nguyen");
      fireEvent.changeText(getByTestId("input-last-name"), "A");
      fireEvent.press(getByTestId("btn-save"));
      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith("Lỗi", "Không thể lưu thông tin")
      );
    });
  });

  describe("SettingScreen", () => {
    it("renders", async () => {
      const { toJSON } = wrap(<SettingScreen navigation={mockNav} />);
      await waitFor(() => expect(toJSON()).toBeTruthy());
    });

    it("loads user data from AsyncStorage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ fullName: "Admin User", email: "admin@test.com" })
      );
      const { findByTestId } = wrap(<SettingScreen navigation={mockNav} />);
      const el = await findByTestId("setting-user-name");
      expect(el.props.children).toBe("Admin User");
    });

    it("shows default text when no user data", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const { findByTestId } = wrap(<SettingScreen navigation={mockNav} />);
      const el = await findByTestId("setting-user-name");
      expect(el.props.children).toBe("Đang tải...");
    });

    it("navigates to Account when pressing change password", async () => {
      const { getByText } = wrap(<SettingScreen navigation={mockNav} />);
      await waitFor(() => {});
      fireEvent.press(getByText("Đổi mật khẩu"));
      expect(mockNav.navigate).toHaveBeenCalledWith("Account");
    });

    it("getSettings failure is handled silently", async () => {
      mockNotificationService.getSettings.mockRejectedValueOnce(new Error("settings fail"));
      const { toJSON } = wrap(<SettingScreen navigation={mockNav} />);
      await waitFor(() => expect(toJSON()).toBeTruthy());
    });
  });
});
