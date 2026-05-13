import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");

  const handleSend = () => {
    // Luồng: Nhập email xong -> Chuyển sang Xác nhận mật khẩu mới
    navigation.navigate("ResetPassword");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.topBlob1} />
          <View style={styles.topBlob2} />

          <View style={styles.content}>
            <Text style={styles.title}>Quên mật khẩu?</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.inputBox} placeholder="   " value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.helperText}>
                <Text style={styles.asterisk}>* </Text>
                Chúng tôi sẽ gửi cho bạn một thông báo để thiết lập hoặc đặt lại mật khẩu mới.
              </Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSend}>
                <Text style={styles.primaryBtnText}>Gửi</Text>
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
  label: { fontSize: 14, fontWeight: "bold", color: "#000000", marginBottom: 8 },
  inputBox: { backgroundColor: "#F2F2F2", borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15, color: "#3C3C43" },
  helperText: { fontSize: 12, color: "#3C3C43", marginBottom: 30, lineHeight: 18 },
  asterisk: { color: "#FFB8B8" }, // Dựa trên bảng màu bạn cung cấp
  primaryBtn: { backgroundColor: "#5F33E1", paddingVertical: 16, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});