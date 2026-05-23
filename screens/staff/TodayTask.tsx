import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowIcon,
  CalendarIcon,
  BriefcaseIcon,
  NotificationIcon,
} from "../../components/Icons";
import { taskService } from "../../services/taskService";
import { useSocketNotification } from "../../context/SocketNotificationContext";

// Generate 61 days: 30 before today, today, 30 after
const generateDays = () => {
  const days = [];
  const today = new Date();
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = -30; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      fullDate: d.toDateString(), // unique key
      isToday: i === 0,
      offset: i,
    });
  }
  return days;
};

const ALL_DAYS = generateDays();
const TODAY_INDEX = 30; // index of today in ALL_DAYS
const ITEM_WIDTH = 64; // width of each date cell including margin

const FILTERS = ["Tất cả", "Cần làm", "Đang làm", "Hoàn thành", "Trễ hạn"];

const STATUS_LABEL: Record<string, string> = {
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  OVERDUE: "Trễ hạn",
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  TODO: { color: "#8B5CF6", bg: "#F5F3FF" },
  IN_PROGRESS: { color: "#F97316", bg: "#FFEDD5" },
  COMPLETED: { color: "#16A34A", bg: "#DCFCE7" },
  OVERDUE: { color: "#DC2626", bg: "#FEE2E2" },
};

const FILTER_TO_STATUS: Record<string, string | null> = {
  "Tất cả": null,
  "Cần làm": "TODO",
  "Đang làm": "IN_PROGRESS",
  "Hoàn thành": "COMPLETED",
  "Trễ hạn": "OVERDUE",
};

const formatTime = (isoString?: string): string => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const isSameDayAsSelected = (
  isoString: string,
  dayInfo: (typeof ALL_DAYS)[0],
): boolean => {
  const selected = new Date(dayInfo.fullDate);
  const d = new Date(isoString);
  return (
    d.getDate() === selected.getDate() &&
    d.getMonth() === selected.getMonth() &&
    d.getFullYear() === selected.getFullYear()
  );
};

export default function TodayTask({ navigation, route }: any) {
  const { unreadCount } = useSocketNotification();
  const routeEventId: string | undefined = route?.params?.eventId;
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width),
  ).current;
  const flatListRef = useRef<FlatList>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getMyTasks(routeEventId);
      if (res?.data) {
        setTasks(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToIndex = (index: number) => {
    const screenWidth = Dimensions.get("window").width - 48; // paddingHorizontal 24*2
    const offset = index * ITEM_WIDTH - screenWidth / 2 + ITEM_WIDTH / 2;
    flatListRef.current?.scrollToOffset({
      offset: Math.max(0, offset),
      animated: true,
    });
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      const timer = setTimeout(() => scrollToIndex(TODAY_INDEX), 100);
      return () => clearTimeout(timer);
    }, []),
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesDate = task.startTime
      ? isSameDayAsSelected(task.startTime, ALL_DAYS[selectedIndex])
      : false;
    const statusFilter = FILTER_TO_STATUS[activeFilter];
    const matchesFilter = statusFilter === null || task.status === statusFilter;
    return matchesDate && matchesFilter;
  });

  const getEventName = (task: any): string => {
    if (task.event && typeof task.event === "object")
      return task.event.name ?? "—";
    return "—";
  };

  const handleSelectDate = (index: number) => {
    setSelectedIndex(index);
    scrollToIndex(index);
  };

  const renderDateItem = ({
    item,
    index,
  }: {
    item: (typeof ALL_DAYS)[0];
    index: number;
  }) => {
    const isSelected = index === selectedIndex;
    return (
      <TouchableOpacity
        style={[styles.dateCell, isSelected && styles.dateCellActive]}
        onPress={() => handleSelectDate(index)}
      >
        <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>
          {item.month}
        </Text>
        <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>
          {item.date}
        </Text>
        <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
          {item.day}
        </Text>
        {item.isToday && !isSelected && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <ArrowIcon color="#1F2937" size={22} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate("Notification")}
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollArea}
        >
          {/* Date Picker - horizontal FlatList */}
          <FlatList
            ref={flatListRef}
            data={ALL_DAYS}
            keyExtractor={(item) => item.fullDate}
            renderItem={renderDateItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePickerContent}
            style={styles.datePicker}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            // Snap so 5 days are visible and selected is centered
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            fadingEdgeLength={3}
          />

          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            fadingEdgeLength={3}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  f === activeFilter && styles.filterBtnActive,
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    f === activeFilter && styles.filterTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Loading */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#5F33E1"
              style={{ marginTop: 40 }}
            />
          )}

          {/* Empty state */}
          {!loading && filteredTasks.length === 0 && (
            <Text style={styles.emptyText}>Không có nhiệm vụ nào</Text>
          )}

          {/* Tasks */}
          {!loading &&
            filteredTasks.map((task, i) => {
              const statusInfo =
                STATUS_COLORS[task.status] ?? STATUS_COLORS.TODO;
              const statusLabel = STATUS_LABEL[task.status] ?? task.status;
              return (
                <TouchableOpacity
                  key={task._id ?? i}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation?.navigate("TaskDetailStaff", {
                      taskId: task._id,
                    })
                  }
                >
                  <View style={styles.taskCard}>
                    <View style={styles.taskTop}>
                      <Text style={styles.taskCategory}>
                        {getEventName(task)}
                      </Text>
                      <View
                        style={[
                          styles.taskIconBox,
                          { backgroundColor: statusInfo.bg },
                        ]}
                      >
                        <BriefcaseIcon color={statusInfo.color} size={16} />
                      </View>
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskBottom}>
                      <View style={styles.taskTimeRow}>
                        <CalendarIcon color="#9CA3AF" size={14} />
                        <Text style={styles.taskTime}>
                          {formatTime(task.startTime)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusInfo.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusInfo.color },
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backIcon: { width: 22, height: 22 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },
  notifIcon: { width: 24, height: 24 },
  scrollArea: { paddingHorizontal: 24, paddingBottom: 120 },

  // Date Picker
  datePicker: { marginBottom: 24, marginHorizontal: -24 },
  datePickerContent: { paddingHorizontal: 24 },
  dateCell: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    width: 56,
    marginRight: 8,
    position: "relative",
  },
  dateCellActive: { backgroundColor: "#5F33E1" },
  dateMonth: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  dateNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  dateDay: { fontSize: 11, color: "#9CA3AF" },
  dateTextActive: { color: "#FFFFFF" },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5F33E1",
    marginTop: 3,
  },

  filterRow: { marginBottom: 20 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#EDE8FF",
  },
  filterBtnActive: { backgroundColor: "#5F33E1" },
  filterText: {
    fontSize: 14,
    fontFamily: "LexendDeca_400Regular",
    color: "#5F33E1",
  },
  filterTextActive: { color: "#FFFFFF", fontFamily: "LexendDeca_700Bold" },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
  },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskCategory: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "LexendDeca_400Regular",
  },
  taskIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  taskIcon: { width: 16, height: 16 },
  taskTitle: {
    fontSize: 18,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  taskBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTimeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  clockIcon: { width: 14, height: 14 },
  taskTime: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "LexendDeca_400Regular",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 12, fontFamily: "LexendDeca_700Bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "LexendDeca_400Regular",
  },
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
