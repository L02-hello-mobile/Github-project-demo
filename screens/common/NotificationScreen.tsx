import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { ArrowIcon } from "../../components/Icons";
import { notificationService } from "../../services/notificationService";
import { socketService } from "../../services/socketService";
import { useSocketNotification } from "../../context/SocketNotificationContext";

function formatNotifMessage(item: any): string {
  const taskName = (typeof item?.task === "object" && item?.task?.title) || "";
  const eventName =
    (typeof item?.event === "object" && item?.event?.name) || "";

  switch (item?.type) {
    case "TASK_ASSIGNED": {
      if (taskName && eventName)
        return `Nhiệm vụ "${taskName}" thuộc sự kiện "${eventName}" đã được giao cho bạn`;
      if (taskName) return `Nhiệm vụ "${taskName}" đã được giao cho bạn`;
      break;
    }
    case "TASK_REMINDER": {
      if (taskName) return `Nhắc nhở: Nhiệm vụ "${taskName}" sắp đến hạn`;
      break;
    }
    case "TASK_STATUS_CHANGED": {
      const status = item?.task?.status ?? item?.status;
      if (status === "OVERDUE" && taskName)
        return `Nhiệm vụ "${taskName}" đã quá thời hạn`;
      if (taskName) return `Nhiệm vụ "${taskName}" đã cập nhật trạng thái`;
      break;
    }
    case "EVENT_INVITE": {
      if (eventName) return `Bạn được mời tham gia sự kiện "${eventName}"`;
      break;
    }
  }
  return item?.message || item?.title || "Thông báo mới";
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function NotificationScreen({ navigation }: any) {
  const { markAsRead } = useSocketNotification();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res?.data ?? res ?? [];
      setNotifications(Array.isArray(list) ? list : []);
      await notificationService.markAllRead().catch(() => {});
      markAsRead();
    } catch (e) {
      console.error("Notification fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time: listen to socket for new notifications (like chat)
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      const notif = data?.notification ?? data;
      if (notif?._id) {
        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.some((n) => n._id === notif._id)) return prev;
          return [{ ...notif, isRead: true }, ...prev];
        });
      }
    };
    socketService.addNotificationListener(handleNewNotification);
    return () => {
      socketService.removeNotificationListener(handleNewNotification);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      console.error("Delete notification error:", e);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Xoá thông báo", "Bạn có muốn xoá thông báo này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const handleTap = (item: any) => {
    const deepLink: string | undefined = item.deepLink ?? item.data?.deepLink;
    if (!deepLink) return;

    const eventMapMatch = deepLink.match(/\/events\/([^/?#\s]+)\/map/);
    const focusTaskMatch = deepLink.match(/focusTask=([^&#\s]+)/);
    const eventMatch = deepLink.match(/\/events\/([^/?#\s]+)/);
    const taskMatch = deepLink.match(/\/tasks\/([^/?#\s]+)/);

    if (eventMapMatch) {
      navigation.navigate("MapViewStaff", {
        eventId: eventMapMatch[1],
        taskId: focusTaskMatch?.[1],
      });
    } else if (taskMatch) {
      navigation.navigate("TaskDetailStaff", { taskId: taskMatch[1] });
    } else if (eventMatch) {
      navigation.navigate("EventDetail", { eventId: eventMatch[1] });
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/bgSplash.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <SafeAreaView
          style={[
            styles.safe,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator
            testID="loading-indicator"
            size="large"
            color="#6366F1"
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="btn-back"
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
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id ?? String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View testID="empty-state" style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Không có thông báo nào</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`notif-item-${item._id}`}
              activeOpacity={0.8}
              onPress={() => handleTap(item)}
              onLongPress={() => confirmDelete(item._id)}
            >
              <View style={styles.notifRow}>
                <Text style={styles.timeText}>
                  {formatTime(item.createdAt)}
                </Text>
                <View
                  style={[
                    styles.bubbleBox,
                    !item.isRead && styles.unreadBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>
                    {formatNotifMessage(item)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
  unreadBubble: {
    backgroundColor: "#EEE9FF",
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  bubbleText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
