import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";

export default function OnboardingScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.topBlob1} />
        <View style={styles.topBlob2} />

        <View style={styles.content}>
          <Text style={styles.title}>Chào mừng trở lại</Text>

          <View style={styles.illustrationPlaceholder}>
            <Image
              source={require("../assets/welcomeBack.png")}
              style={styles.welcomeImg}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              testID="input-email"
              style={styles.input}
              placeholder="   "
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              testID="input-password"
              style={styles.input}
              placeholder="      "
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-login"
              style={styles.loginBtn}
              onPress={() => navigation?.navigate("Main")}
            >
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity>
                <Text style={styles.signUpText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, backgroundColor: "transparent" },
  topBlob1: {
    position: "absolute",
    top: -54,
    left: -94,
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: "#5F33E1",
    opacity: 0.44,
  },
  topBlob2: {
    position: "absolute",
    top: -95,
    left: -39,
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: "#5F33E1",
    opacity: 0.44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 40,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  circleBg: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#EEF2FF",
  },
  welcomeImg: { width: 200, height: 200 },
  form: { width: "100%" },
  label: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 25,
  },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 40 },
  forgotText: { color: "#6366F1", fontWeight: "700" },
  loginBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(99, 102, 241, 0.3)",
  },
  loginBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 25 },
  footerText: { color: "#4B5563" },
  signUpText: { color: "#6366F1", fontWeight: "bold" },
});
