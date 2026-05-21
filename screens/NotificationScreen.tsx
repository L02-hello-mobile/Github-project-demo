import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { ArrowIcon } from "../components/Icons";

const notifications = [
  {
    id: 1,
    time: "14:08",
    message: "Task ID WRK-004568 status has been updated to In-progress.",
    bubble: true,
  },
  {
    id: 2,
    time: "14:05",
    message: "Task ID WRK-004568 has been assigned to you.",
    bubble: true,
  },
  {
    id: 3,
    time: "08/01/2025, 11:34",
    message: "Asset ID V-0260714 has been created successfully.",
    bubble: true,
  },
];

export default function NotificationScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <ArrowIcon color="#1F2937" size={22} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <View style={styles.backBtn} />
        </View>

        {/* List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {notifications.map((item) => (
            <View key={item.id} style={styles.notifRow}>
              <Text style={styles.timeText}>{item.time}</Text>
              {item.bubble ? (
                <View style={styles.bubbleBox}>
                  <Text style={styles.bubbleText}>{item.message}</Text>
                </View>
              ) : (
                <Text style={styles.plainText}>{item.message}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  safe: { flex: 1, paddingTop: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 4,
  },
  notifRow: {
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginBottom: 4,
  },
  bubbleBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  bubbleText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  plainText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
});