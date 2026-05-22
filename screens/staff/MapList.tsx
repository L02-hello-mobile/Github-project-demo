import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { MapIcon, NotificationIcon } from "../../components/Icons";

const EVENTS = [
  { id: "1", name: "Job fair", tasks: null, color: "#FFCDD2" },
  { id: "2", name: "Câu lạc bộ âm nhạc", tasks: 30, color: "#D1C4E9" },
  { id: "3", name: "Team building", tasks: 30, color: "#FFE0B2" },
  { id: "4", name: "Daily Study", tasks: null, color: "#FFF9C4" },
];

export default function MapList_Staff({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Bản đồ</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{EVENTS.length}</Text>
          </View>
        </View>
        <NotificationIcon color="#1F2937" size={24} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {EVENTS.map((event) => (
          <Pressable
            key={event.id}
            style={styles.card}
            android_ripple={{ color: "transparent" }}
            onPress={() => navigation.navigate("MapViewStaff")}
          >
            <View style={[styles.dot, { backgroundColor: event.color }]} />
            <View style={styles.info}>
              <Text style={styles.eventName}>{event.name}</Text>
              {event.tasks != null && (
                <Text style={styles.taskCount}>{event.tasks} Tasks</Text>
              )}
            </View>
            <MapIcon color="#5F33E1" size={26} />
          </Pressable>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  badge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeTxt: { fontSize: 13, fontWeight: "700", color: "#6366F1" },
  list: { paddingHorizontal: 24, paddingBottom: 120 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 14,
  },
  info: { flex: 1 },
  eventName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  taskCount: { fontSize: 12, color: "#9CA3AF", marginTop: 3 },
});
