import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";

export default function ResetPasswordScreen({ navigation }: any) {
  const [newPassword, setNewPassword] = useState("");

  const handleConfirm = () => {
    // Luồng: Đặt lại mật khẩu xong -> Về trang Login
    Alert.alert("Thành công", "Mật khẩu của bạn đã được thay đổi.", [
      { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
    ]);
  };

  const handleResend = () => {
    Alert.alert("Thông báo", "Đã gửi lại yêu cầu vào email của bạn.");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.topBlob1} />
          <View style={styles.topBlob2} />

          <View style={styles.content}>
            <Text style={styles.title}>Xác nhận mật khẩu</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Nhập mật khẩu mới gửi đến Email của bạn</Text>
              <TextInput style={styles.inputBox} placeholder="••••••" secureTextEntry value={newPassword} onChangeText={setNewPassword} />

              <TouchableOpacity onPress={handleResend} style={styles.resendWrapper}>
                <Text style={styles.resendText}>
                  <Text style={styles.asterisk}>* </Text>Gửi lại
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
                <Text style={styles.primaryBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  topBlob1: { position: "absolute", top: -54, left: -94, width: 188, height: 188, borderRadius: 94, backgroundColor: "#5F33E1", opacity: 0.44 },
  topBlob2: { position: "absolute", top: -95, left: -39, width: 188, height: 188, borderRadius: 94, backgroundColor: "#5F33E1", opacity: 0.44 },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 160 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", marginBottom: 40, textAlign: "center" },
   form: { 
    width: "100%",
    zIndex: 10, 
    elevation: 10 
  },
  label: { fontSize: 14, fontWeight: "bold", color: "#000000", marginBottom: 12 },
  inputBox: { backgroundColor: "#F2F2F2", borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15, color: "#3C3C43" },
  resendWrapper: { marginBottom: 30, alignSelf: "flex-start" },
  resendText: { fontSize: 12, color: "#3C3C43" },
  asterisk: { color: "#FFB8B8" },
  primaryBtn: { backgroundColor: "#5F33E1", paddingVertical: 16, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});