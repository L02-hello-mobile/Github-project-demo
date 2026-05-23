import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowIcon } from "../../components/Icons";
import { uploadService } from "../../services/uploadService";

export default function AccountScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;
      const user = JSON.parse(stored);
      setUserData(user);
      // Split fullName into firstName / lastName
      const parts = (user.fullName || "").trim().split(/\s+/);
      if (parts.length >= 2) {
        setFirstName(parts.slice(0, -1).join(" "));
        setLastName(parts[parts.length - 1]);
      } else {
        setFirstName(parts[0] || "");
        setLastName("");
      }
      if (user.avatarUrl) setAvatarUri(user.avatarUrl);
    } catch {}
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cấp quyền thư viện ảnh để thay đổi ảnh đại diện.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
      const res = await uploadService.uploadImage(formData);
      const url = res?.data?.imageUrl ?? res?.imageUrl ?? uri;
      setAvatarUri(url);
      // Persist updated avatar into AsyncStorage
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const updated = { ...JSON.parse(stored), avatarUrl: url };
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        setUserData(updated);
      }
    } catch {
      setAvatarUri(uri); // show local preview even if upload failed
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const fullName = [firstName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");
    if (!fullName) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
    }
    setSaving(true);
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const updated = { ...JSON.parse(stored), fullName };
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        setUserData(updated);
      }
      Alert.alert("Thành công", "Thông tin đã được lưu");
    } catch {
      Alert.alert("Lỗi", "Không thể lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const initial = (userData?.fullName || firstName || "U")[0].toUpperCase();

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          testID="btn-back"
        >
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <TouchableOpacity
          testID="btn-avatar"
          style={styles.avatarCard}
          onPress={handlePickAvatar}
          activeOpacity={0.8}
        >
          {uploading ? (
            <View style={styles.avatarCircle}>
              <ActivityIndicator color="#6366F1" />
            </View>
          ) : avatarUri ? (
            <Image
              testID="avatar-image"
              source={{ uri: avatarUri }}
              style={styles.avatarCircle}
            />
          ) : (
            <View style={[styles.avatarCircle, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.avatarHint}>
            Nhấn để thay đổi ảnh đại diện{"\n"}
            Allowed *.jpeg, *.jpg, *.png — tối đa 3 MB
          </Text>
        </TouchableOpacity>

        {/* Thông tin chung */}
        <Text style={styles.sectionTitle}>Thông tin chung</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            testID="input-email"
            style={[styles.input, styles.inputDisabled]}
            value={userData?.email || ""}
            editable={false}
            placeholder="email@example.com"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            testID="input-first-name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập tên"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ</Text>
          <TextInput
            testID="input-last-name"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập họ"
          />
        </View>

        <TouchableOpacity
          testID="btn-save"
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnTxt}>Lưu thông tin</Text>
          )}
        </TouchableOpacity>

        {/* Đổi mật khẩu */}
        <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        <View style={styles.comingSoonBox}>
          <Text style={styles.comingSoonText}>
            Tính năng đang phát triển. Vui lòng thử lại sau.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  content: { padding: 20, paddingBottom: 50 },
  avatarCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    marginBottom: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallback: {
    backgroundColor: "#EDE8FF",
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6366F1",
  },
  avatarHint: { textAlign: "center", color: "#9CA3AF", fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5F33E1",
    marginBottom: 15,
    marginTop: 10,
  },
  inputGroup: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  label: { fontSize: 11, color: "#9CA3AF", marginBottom: 5 },
  input: { fontSize: 15, color: "#1F2937", paddingVertical: 0 },
  inputDisabled: { color: "#9CA3AF" },
  saveBtn: {
    backgroundColor: "#5F33E1",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnTxt: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  comingSoonBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  comingSoonText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
});
