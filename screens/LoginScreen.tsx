import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigation.replace("Main");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* 1. FIX KEYBOARD: Thêm keyboardShouldPersistTaps="handled" vào ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.topBlob1} />
          <View style={styles.topBlob2} />

          <View style={styles.content}>
            <Text style={styles.title}>Chào mừng trở lại</Text>

            <View style={styles.illustrationPlaceholder}>
              <Image source={require("../assets/welcomeBack.png")} style={styles.welcomeImg} resizeMode="contain" />
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.inputUnderline} placeholder="mary.elliot@mail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput style={styles.inputUnderline} placeholder="••••••••••••" secureTextEntry value={password} onChangeText={setPassword} />

              <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                <Text style={styles.primaryBtnText}>Đăng nhập</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                  <Text style={styles.linkText}>Đăng ký</Text>
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
  content: { flex: 1, paddingHorizontal: 30, alignItems: "center", paddingTop: 100, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", marginBottom: 30 },
  illustrationPlaceholder: { width: 150, height: 150, marginBottom: 30 },
  welcomeImg: { width: "100%", height: "100%" },
  
  // 2. FIX Z-INDEX: Ép khối form nổi lên trên 2 cái blob absolute
  form: { 
    width: "100%",
    zIndex: 10, 
    elevation: 10 
  },
  
  label: { fontSize: 14, fontWeight: "bold", color: "#000000", marginBottom: 8 },
  inputUnderline: { borderBottomWidth: 1, borderBottomColor: "#D1D1D6", paddingVertical: 10, fontSize: 16, marginBottom: 20, color: "#3C3C43" },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 30 },
  forgotText: { color: "#5F33E1", fontWeight: "bold", fontSize: 14 },
  primaryBtn: { backgroundColor: "#5F33E1", paddingVertical: 16, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#3C3C43", fontSize: 14 },
  linkText: { color: "#5F33E1", fontWeight: "bold", fontSize: 14 },
});