import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";

export default function NotificationScreen({ navigation }: any) {
  // Dữ liệu đã loại bỏ thuộc tính 'type' gây chia tách giao diện
  const notis = [
    { id: 1, text: "You have received a new message from the Operation Centre.", time: "15:22" },
    { id: 2, text: "You have received a new message from the Operation Centre.", time: "15:22" },
    { id: 3, text: "You have received a new message from Jeanette Barker.", time: "14:09" },
    { id: 4, text: "Task ID WRK-004568 status has been updated to In-progress.", time: "14:08" },
    { id: 5, text: "Task ID WRK-004568 has been assigned to you.", time: "14:05" },
    { id: 6, text: "Asset ID V-0260714 has been created successfully.", time: "08/01/2025, 11:34" },
  ];

  return (
    <ImageBackground source={require("../assets/bgSplash.png")} style={styles.bg} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>{"<-"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notis.map((item) => (
          <View key={item.id} style={styles.itemWrapper}>
            <Text style={styles.timeTxt}>{item.time}</Text>
            <View style={styles.bubble}>
              <Text style={styles.msgTxt}>{item.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 10 
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backTxt: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  content: { padding: 20 },
  itemWrapper: { marginBottom: 15 },
  timeTxt: { 
    fontSize: 10, 
    color: "#9CA3AF", 
    textAlign: "right", 
    marginBottom: 4,
    marginRight: 4 
  },
  bubble: { 
    padding: 15, 
    borderRadius: 12, 
    backgroundColor: "#F3F4F6", // Màu xám đồng nhất cho tất cả các thẻ
  },
  msgTxt: { 
    fontSize: 14, 
    color: "#1F2937", 
    lineHeight: 20 
  },
});