import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  NotificationIcon,
  BriefcaseIcon,
  MapIcon,
  CalendarIcon,
} from "../../components/Icons";
import InvitePopup from "../../components/InvitePopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventService } from "../../services/eventService";
import { taskService } from "../../services/taskService";
import { useFocusEffect } from "@react-navigation/native";
import { useSocketNotification } from "../../context/SocketNotificationContext";

function CircularProgress({ percent }: { percent: number }) {
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
        />
      </Svg>
      <Text
        style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}
      >{`${percent}%`}</Text>
    </View>
  );
}

const EVENT_COLORS = ["#FCE7F3", "#E0E7FF", "#FFEDD5", "#DCFCE7", "#FEF3C7"];
const EVENT_ICON_COLORS = [
  "#DB2777",
  "#4F46E5",
  "#F97316",
  "#16A34A",
  "#D97706",
];

const TASK_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  TODO: { color: "#8B5CF6", bg: "#F5F3FF" },
  IN_PROGRESS: { color: "#F97316", bg: "#FFEDD5" },
  COMPLETED: { color: "#16A34A", bg: "#DCFCE7" },
  OVERDUE: { color: "#DC2626", bg: "#FEE2E2" },
};
const TASK_STATUS_LABEL: Record<string, string> = {
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  OVERDUE: "Trễ hạn",
};

function formatTaskTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

export default function HomeScreen({ navigation }: any) {
  const { unreadCount, refreshUnreadCount } = useSocketNotification();
  const [userData, setUserData] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [participatingTasks, setParticipatingTasks] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [currentInviteIdx, setCurrentInviteIdx] = useState(0);
  const [todayStats, setTodayStats] = useState({ done: 0, total: 0 });

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshUnreadCount();
    }, []),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem("userData");
      const user = stored ? JSON.parse(stored) : null;
      if (user) setUserData(user);
      const myId = user?._id;

      const res = await eventService.getMyEvents();
      const allEvents: any[] = (res.success ? res.data : res) || [];
      const organizer: any[] = [];
      const participating: any[] = [];
      const pending: any[] = [];
      for (const ev of allEvents) {
        const myEntry = ev.members?.find(
          (m: any) => (m.user?._id ?? m.user) === myId,
        );
        if (myEntry?.status === "PENDING") {
          pending.push({ ...ev, _myRole: myEntry.role });
          continue;
        }
        const isOrg =
          !myEntry ||
          myEntry.role === "ORGANIZER" ||
          myEntry.role === "CO_ORGANIZER" ||
          (ev.createdBy?._id ?? ev.createdBy) === myId;
        if (isOrg) organizer.push(ev);
        else participating.push(ev);
      }
      setMyEvents(organizer);
      setPendingInvites(pending);
      setCurrentInviteIdx(0);

      // Fetch tasks assigned to me across all participating events
      try {
        const tasksRes = await taskService.getMyTasks();
        const allTasks: any[] = tasksRes?.data ?? [];

        // Compute today's task progress (tất cả nhiệm vụ được giao hôm nay)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todayTasks = allTasks.filter((t: any) => {
          const start = t.startTime ? new Date(t.startTime) : null;
          const end = t.endTime ? new Date(t.endTime) : null;
          // Task thuộc hôm nay nếu khoảng [start, end] giao với [todayStart, todayEnd]
          if (start && end) return start <= todayEnd && end >= todayStart;
          if (start) return start >= todayStart && start <= todayEnd;
          if (end) return end >= todayStart && end <= todayEnd;
          return false;
        });
        const doneTasks = todayTasks.filter(
          (t: any) => t.status === "COMPLETED",
        );
        setTodayStats({ done: doneTasks.length, total: todayTasks.length });

        // Only show tasks from events the user is participating in (not organizer)
        const participatingEventIds = new Set(
          participating.map((e: any) => e._id),
        );
        const myTasks = allTasks.filter((t: any) => {
          const evId = typeof t.event === "object" ? t.event?._id : t.event;
          return participatingEventIds.has(evId);
        });
        myTasks.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.startTime || 0).getTime();
          const dateB = new Date(b.createdAt || b.startTime || 0).getTime();
          return dateB - dateA;
        });
        setParticipatingTasks(myTasks);
      } catch {}

      const allAccepted = [...organizer, ...participating];
      const progMap: Record<string, number> = {};
      await Promise.all(
        allAccepted.map(async (ev: any) => {
          try {
            const p = await eventService.getEventProgress(ev._id);
            progMap[ev._id] = p.data?.percentage ?? p.percentage ?? 0;
          } catch {}
        }),
      );
      setProgressMap(progMap);
    } catch (e) {
      console.error("HomeScreen load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteRespond = async (accept: boolean) => {
    const invite = pendingInvites[currentInviteIdx];
    if (!invite) return;
    try {
      await eventService.respondInvite({ eventId: invite._id, accept });
    } catch {}
    if (currentInviteIdx + 1 < pendingInvites.length) {
      setCurrentInviteIdx((i) => i + 1);
    } else {
      setPendingInvites([]);
    }
    if (accept) loadData();
  };

  const currentInvite = pendingInvites[currentInviteIdx];
  const bannerPercent =
    todayStats.total > 0
      ? Math.round((todayStats.done / todayStats.total) * 100)
      : 0;

  return (
    <>
      <ImageBackground
        source={require("../../assets/bgSplash.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Account")}
                >
                  <View style={styles.avatar} />
                </TouchableOpacity>
                <View>
                  <Text style={styles.helloText}>Hello!</Text>
                  <Text style={styles.nameText}>
                    {userData?.fullName || "Người dùng"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                testID="btn-notification"
                onPress={() => navigation.navigate("Notification")}
                activeOpacity={0.7}
                style={{ position: "relative" }}
              >
                <NotificationIcon color="#1F2937" />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  {todayStats.total > 0
                    ? `${todayStats.done}/${todayStats.total} nhiệm vụ hôm nay hoàn thành`
                    : "Không có nhiệm vụ nào hôm nay"}
                </Text>
                <TouchableOpacity
                  testID="btn-action"
                  style={styles.bannerBtn}
                  onPress={() => navigation.navigate("Calendar")}
                >
                  <Text style={styles.bannerBtnText}>Xem nhiệm vụ</Text>
                </TouchableOpacity>
              </View>
              <CircularProgress percent={bannerPercent} />
            </View>

            {/* Đang tham gia */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đang tham gia</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {participatingTasks.length}
                </Text>
              </View>
            </View>

            {participatingTasks.length === 0 ? (
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 13,
                  marginBottom: 24,
                  marginLeft: 4,
                }}
              >
                Chưa có nhiệm vụ nào được giao
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.hList}
                contentContainerStyle={{ paddingRight: 25 }}
                nestedScrollEnabled
              >
                {participatingTasks.map((task: any, idx: number) => {
                  const statusInfo =
                    TASK_STATUS_COLORS[task.status] ?? TASK_STATUS_COLORS.TODO;
                  const statusLabel =
                    TASK_STATUS_LABEL[task.status] ?? task.status;
                  const eventName =
                    typeof task.event === "object" ? task.event?.name : "";
                  return (
                    <TouchableOpacity
                      key={task._id}
                      style={[
                        styles.cardH,
                        {
                          backgroundColor:
                            EVENT_COLORS[idx % EVENT_COLORS.length],
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate("TaskDetailStaff", {
                          taskId: task._id,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.tag}>{eventName}</Text>
                      <Text style={styles.cardHTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View style={styles.cardHBottom}>
                        <CalendarIcon color="#9CA3AF" size={14} />
                        <Text style={styles.cardHTime}>
                          {formatTaskTime(task.startTime)}
                        </Text>
                        <View
                          style={[
                            styles.taskStatusBadge,
                            { backgroundColor: statusInfo.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.taskStatusText,
                              { color: statusInfo.color },
                            ]}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Sự kiện */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện của tôi</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{myEvents.length}</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                color="#5F33E1"
                style={{ marginVertical: 20 }}
              />
            ) : myEvents.length === 0 ? (
              <Text
                style={{
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginVertical: 20,
                }}
              >
                Chưa có sự kiện nào
              </Text>
            ) : (
              myEvents.map((ev: any, idx: number) => (
                <TouchableOpacity
                  key={ev._id}
                  style={styles.eventItem}
                  onPress={() =>
                    navigation.navigate("EventDetail", { eventId: ev._id })
                  }
                >
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          EVENT_COLORS[idx % EVENT_COLORS.length],
                      },
                    ]}
                  >
                    <BriefcaseIcon
                      color={EVENT_ICON_COLORS[idx % EVENT_ICON_COLORS.length]}
                      size={20}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.eventTitle}>{ev.name}</Text>
                    <Text style={styles.eventSub}>
                      {ev.taskCount ? `${ev.taskCount} Tasks` : ""}
                    </Text>
                  </View>
                  <Text style={styles.eventPercent}>
                    {Math.round(progressMap[ev._id] ?? 0)}%
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </ImageBackground>

      {currentInvite && (
        <InvitePopup
          visible
          inviterName={currentInvite.createdBy?.fullName || "Quản trị viên"}
          inviterInitial={(currentInvite.createdBy?.fullName ||
            "Q")[0].toUpperCase()}
          eventName={currentInvite.name}
          role={
            currentInvite._myRole === "ORGANIZER"
              ? "Trưởng ban"
              : currentInvite._myRole === "CO_ORGANIZER"
                ? "Phó ban"
                : "Thành viên"
          }
          onAccept={() => handleInviteRespond(true)}
          onDecline={() => handleInviteRespond(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, paddingTop: 40 },
  scrollArea: { padding: 25, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0EA5E9",
    marginRight: 15,
  },
  helloText: { color: "#6B7280", fontSize: 14 },
  nameText: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  banner: {
    backgroundColor: "#5F33E1",
    borderRadius: 30,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 15,
    lineHeight: 22,
  },
  bannerBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: "#5F33E1", fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  badge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeText: { color: "#8B5CF6", fontWeight: "bold", fontSize: 12 },
  hList: { marginBottom: 35 },
  cardH: {
    width: 240,
    backgroundColor: "#EEF2FF",
    borderRadius: 25,
    padding: 20,
    marginRight: 15,
  },
  tag: { color: "#6B7280", fontSize: 12, marginBottom: 8 },
  cardHTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    flex: 1,
  },
  cardHBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardHTime: { fontSize: 13, color: "#9CA3AF" },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: "auto" as any,
  },
  taskStatusText: { fontSize: 11, fontWeight: "600" },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImg: { width: 20, height: 20 },
  eventTitle: { fontWeight: "bold", fontSize: 16, color: "#1F2937" },
  eventSub: { color: "#9CA3AF", fontSize: 13 },
  eventPercent: {
    fontWeight: "bold",
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    borderRadius: 12,
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "bold",
  },
});
