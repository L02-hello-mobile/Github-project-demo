import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput } from "react-native";

export default function AccountScreen({ navigation }: any) {
  return (
    <ImageBackground source={require("../assets/bgSplash.png")} style={styles.bg} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>{"<-"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle} />
          <Text style={styles.avatarHint}>Allowed *.jpeg, *.jpg, *.png, *.gif{"\n"}max size of 3 Mb</Text>
        </View>

        {/* Thông tin chung */}
        <Text style={styles.sectionTitle}>Thông tin chung</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput style={styles.input} value="john.brown@workorganizer.co" editable={false} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên</Text>
          <TextInput style={styles.input} defaultValue="John" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ</Text>
          <TextInput style={styles.input} defaultValue="Brown" />
        </View>

        {/* Đổi mật khẩu */}
        <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="New password" secureTextEntry />
        </View>
        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Confirm new password" secureTextEntry />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnTxt}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backTxt: { fontSize: 20, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 50 },
  avatarCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#E5E7EB", marginBottom: 15 },
  avatarHint: { textAlign: "center", color: "#9CA3AF", fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#5F33E1", marginBottom: 15, marginTop: 10 },
  inputGroup: { backgroundColor: "#FFF", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  label: { fontSize: 11, color: "#9CA3AF", marginBottom: 5 },
  input: { fontSize: 15, color: "#1F2937", paddingVertical: 0 },
  saveBtn: { backgroundColor: "#5F33E1", paddingVertical: 16, borderRadius: 10, alignItems: "center", marginTop: 20 },
  saveBtnTxt: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});