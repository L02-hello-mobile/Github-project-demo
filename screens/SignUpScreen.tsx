import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";

export default function SignUpScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    // Luồng: Đăng ký thành công -> Về Login
    Alert.alert("Thành công", "Đăng ký thành công!", [
      { text: "Đăng nhập ngay", onPress: () => navigation.navigate("Login") }
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.topBlob1} />
          <View style={styles.topBlob2} />

          <View style={styles.content}>
            <Text style={styles.title}>Chào mừng bạn gia nhập!</Text>
            <Text style={styles.subtitle}>Hãy để chúng tôi giúp bạn hoàn thành công việc</Text>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Họ</Text>
                  <TextInput style={styles.inputBox} placeholder="Elliot" value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Tên</Text>
                  <TextInput style={styles.inputBox} placeholder="Elliot" value={lastName} onChangeText={setLastName} />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.inputBox} placeholder="mary.elliot@mail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput style={styles.inputBox} placeholder="••••••••••••" secureTextEntry value={password} onChangeText={setPassword} />

              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput style={styles.inputBox} placeholder="••••••••••••" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
                <Text style={styles.primaryBtnText}>Đăng ký</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
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
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 120, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#3C3C43", marginBottom: 30, textAlign: "center", paddingHorizontal: 20 },
   form: { 
    width: "100%",
    zIndex: 10, 
    elevation: 10 
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInputContainer: { width: "47%" },
  label: { fontSize: 14, fontWeight: "bold", color: "#000000", marginBottom: 8 },
  inputBox: { backgroundColor: "#F2F2F2", borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 20, color: "#3C3C43" },
  primaryBtn: { backgroundColor: "#5F33E1", paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 10 },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#3C3C43", fontSize: 14 },
  linkText: { color: "#5F33E1", fontWeight: "bold", fontSize: 14 },
});