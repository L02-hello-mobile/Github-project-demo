import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AccountScreen from "../screens/common/AccountScreen";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("../services/uploadService", () => ({
  uploadService: {
    uploadImage: jest
      .fn()
      .mockResolvedValue({
        data: { imageUrl: "https://cdn.example.com/avatar.jpg" },
      }),
  },
}));

const ImagePicker = require("expo-image-picker");
const { uploadService } = require("../services/uploadService");

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};

const SAMPLE_USER = {
  _id: "u1",
  fullName: "Trần Thị Bình",
  email: "binh.tran@example.com",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AccountScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("1. Màn hình render không bị crash", async () => {
    const { toJSON } = render(<AccountScreen navigation={mockNavigation} />);
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị tiêu đề Tài khoản", async () => {
    const { getByText } = render(<AccountScreen navigation={mockNavigation} />);
    await waitFor(() => expect(getByText("Tài khoản")).toBeTruthy());
  });

  it("3. Hiển thị section thông tin và đổi mật khẩu", async () => {
    const { getByText } = render(<AccountScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText("Thông tin chung")).toBeTruthy();
      expect(getByText("Đổi mật khẩu")).toBeTruthy();
    });
  });

  it("4. Hiển thị thông báo coming soon cho đổi mật khẩu", async () => {
    const { getByText } = render(<AccountScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(
        getByText("Tính năng đang phát triển. Vui lòng thử lại sau."),
      ).toBeTruthy();
    });
  });

  // ── Load user data ─────────────────────────────────────────────────────────

  it("5. Gọi AsyncStorage.getItem('userData') khi mount", async () => {
    render(<AccountScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("userData");
    });
  });

  it("6. Hiển thị email từ AsyncStorage (readonly)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("input-email").props.value).toBe(
        "binh.tran@example.com",
      );
    });
  });

  it("7. Tách fullName thành firstName và lastName đúng", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ ...SAMPLE_USER, fullName: "Nguyễn Văn Hùng" }),
    );
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("input-first-name").props.value).toBe("Nguyễn Văn");
      expect(getByTestId("input-last-name").props.value).toBe("Hùng");
    });
  });

  it("8. Tên một từ — firstName có giá trị, lastName rỗng", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ ...SAMPLE_USER, fullName: "Admin" }),
    );
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("input-first-name").props.value).toBe("Admin");
      expect(getByTestId("input-last-name").props.value).toBe("");
    });
  });

  it("9. Input email không thể chỉnh sửa", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("input-email").props.editable).toBe(false);
    });
  });

  // ── Save functionality ─────────────────────────────────────────────────────

  it("10. Nút Lưu thông tin hiển thị đúng", async () => {
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => expect(getByTestId("btn-save")).toBeTruthy());
  });

  it("11. Nhấn Lưu cập nhật AsyncStorage với fullName mới", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("input-first-name"));

    await act(async () => {
      fireEvent.changeText(getByTestId("input-first-name"), "Trần Thị");
      fireEvent.changeText(getByTestId("input-last-name"), "Mai");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-save"));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "userData",
        expect.stringContaining("Trần Thị Mai"),
      );
    });
    alertSpy.mockRestore();
  });

  it("12. Nhấn Lưu hiển thị Alert thành công", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-save"));

    await act(async () => {
      fireEvent.press(getByTestId("btn-save"));
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Thành công", expect.any(String));
    });
    alertSpy.mockRestore();
  });

  it("13. Nhấn Lưu với tên rỗng hiển thị alert lỗi", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ ...SAMPLE_USER, fullName: "" }),
    );
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("input-first-name"));

    // Clear both name fields
    await act(async () => {
      fireEvent.changeText(getByTestId("input-first-name"), "");
      fireEvent.changeText(getByTestId("input-last-name"), "");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-save"));
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Lỗi", expect.any(String));
    });
    alertSpy.mockRestore();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("14. Nút back gọi navigation.goBack()", async () => {
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-back"));
    fireEvent.press(getByTestId("btn-back"));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  // ── Avatar ─────────────────────────────────────────────────────────────────

  it("15. Nút avatar tồn tại và nhấn được", async () => {
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => expect(getByTestId("btn-avatar")).toBeTruthy());
    // Pressing it should trigger permission request (mocked)
    await act(async () => {
      fireEvent.press(getByTestId("btn-avatar"));
    });
    await waitFor(() => {
      expect(
        ImagePicker.requestMediaLibraryPermissionsAsync,
      ).toHaveBeenCalledTimes(1);
    });
  });

  it("16. Không upload khi người dùng huỷ picker", async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: true,
    });
    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-avatar"));

    await act(async () => {
      fireEvent.press(getByTestId("btn-avatar"));
    });

    await waitFor(() => {
      expect(uploadService.uploadImage).not.toHaveBeenCalled();
    });
  });

  it("17. Upload ảnh khi chọn từ picker thành công", async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///local/photo.jpg" }],
    });

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-avatar"));

    await act(async () => {
      fireEvent.press(getByTestId("btn-avatar"));
    });

    await waitFor(() => {
      expect(uploadService.uploadImage).toHaveBeenCalledTimes(1);
    });
  });

  it("18. Sau upload thành công, hiển thị avatar image", async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///local/photo.jpg" }],
    });
    uploadService.uploadImage.mockResolvedValueOnce({
      data: { imageUrl: "https://cdn.example.com/new-avatar.jpg" },
    });

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-avatar"));

    await act(async () => {
      fireEvent.press(getByTestId("btn-avatar"));
    });

    await waitFor(() => {
      expect(getByTestId("avatar-image")).toBeTruthy();
    });
  });

  it("19. Xử lý quyền bị từ chối — hiển thị Alert", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByTestId } = render(
      <AccountScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("btn-avatar"));

    await act(async () => {
      fireEvent.press(getByTestId("btn-avatar"));
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Cần quyền truy cập",
        expect.any(String),
      );
    });
    alertSpy.mockRestore();
  });
});
