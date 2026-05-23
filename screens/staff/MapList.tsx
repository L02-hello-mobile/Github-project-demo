import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { MapIcon, NotificationIcon } from "../../components/Icons";
import { eventService } from "../../services/eventService";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSocketNotification } from "../../context/SocketNotificationContext";

const DOT_COLORS = [
  "#FFCDD2",
  "#D1C4E9",
  "#FFE0B2",
  "#FFF9C4",
  "#B2DFDB",
  "#BBDEFB",
];

export default function MapList_Staff({ navigation }: any) {
  const { unreadCount } = useSocketNotification();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const loadOrganizerEvents = async () => {
        setLoading(true);
        try {
          const stored = await AsyncStorage.getItem("userData");
          const myId = stored ? JSON.parse(stored)?._id : null;
          const res = await eventService.getMyEvents();
          const all: any[] = res?.data
            ? Array.isArray(res.data)
              ? res.data
              : []
            : [];
          const organizer = all.filter((ev: any) => {
            const myEntry = ev.members?.find(
              (m: any) => (m.user?._id ?? m.user) === myId,
            );
            return (
              !myEntry ||
              myEntry.role === "ORGANIZER" ||
              myEntry.role === "CO_ORGANIZER"
            );
          });
          if (!cancelled) setEvents(organizer);
        } catch (e) {
          console.error("Failed to fetch events:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      loadOrganizerEvents();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Quản lý Bản đồ</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{events.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
          style={{ position: "relative" }}
        >
          <NotificationIcon color="#1F2937" size={24} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <ActivityIndicator
            size="large"
            color="#5F33E1"
            style={{ marginTop: 40 }}
          />
        )}
        {!loading &&
          events.map((event, idx) => (
            <Pressable
              key={event._id}
              style={styles.card}
              android_ripple={{ color: "transparent" }}
              onPress={() =>
                navigation.navigate("MapViewStaff", { eventId: event._id })
              }
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: DOT_COLORS[idx % DOT_COLORS.length] },
                ]}
              />
              <View style={styles.info}>
                <Text style={styles.eventName}>{event.name}</Text>
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
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
