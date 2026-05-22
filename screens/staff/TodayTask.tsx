import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
  ArrowIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapIcon,
  NotificationIcon,
} from "../../components/Icons";

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

const FILTERS = ["Tất cả", "Cần làm", "Đang làm", "Hoàn thành"];

const TASKS = [
  {
    category: "Job Fair",
    title: "Kê bàn",
    group: "Nhóm khu C",
    description:
      "Sinh viên tình nguyện thực hiện việc kê bàn theo đúng khu vực quy định, số lượng 100 bàn.",
    startDate: "01 May, 2026",
    endDate: "01 May, 2026",
    time: "10:00 AM",
    status: "Done",
    statusColor: "#6366F1",
    statusBg: "#EEF2FF",
    IconComponent: BriefcaseIcon,
    iconBg: "#EEF2FF",
    iconTint: "#6366F1",
  },
  {
    category: "Câu lạc bộ âm nhạc",
    title: "Mua nước",
    group: "Nhóm khu B",
    description:
      "Mua nước uống cho toàn bộ thành viên tham gia sự kiện, số lượng 200 chai.",
    startDate: "01 May, 2026",
    endDate: "01 May, 2026",
    time: "12:00 PM",
    status: "In Progress",
    statusColor: "#F97316",
    statusBg: "#FFEDD5",
    IconComponent: MapIcon,
    iconBg: "#FFEDD5",
    iconTint: "#F97316",
  },
  {
    category: "Mùa hè xanh",
    title: "Đi chợ",
    group: "Nhóm hậu cần",
    description:
      "Mua thực phẩm và vật tư cần thiết phục vụ bữa ăn tình nguyện tại địa điểm quy định.",
    startDate: "01 May, 2026",
    endDate: "02 May, 2026",
    time: "07:00 PM",
    status: "To-do",
    statusColor: "#8B5CF6",
    statusBg: "#F5F3FF",
    IconComponent: BriefcaseIcon,
    iconBg: "#F5F3FF",
    iconTint: "#8B5CF6",
  },
];

export default function TodayTask({ navigation }: any) {
  const isFocused = useIsFocused();
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width),
  ).current;
  const flatListRef = useRef<FlatList>(null);

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

  useEffect(() => {
    if (!isFocused) return;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    const timer = setTimeout(() => scrollToIndex(TODAY_INDEX), 100);
    return () => clearTimeout(timer);
  }, [isFocused]);

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
          <NotificationIcon color="#1F2937" />
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

          {/* Tasks */}
          {TASKS.map((task, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate("TaskDetailStaff", { task })}
            >
            <View style={styles.taskCard}>
              <View style={styles.taskTop}>
                <Text style={styles.taskCategory}>{task.category}</Text>
                <View
                  style={[styles.taskIconBox, { backgroundColor: task.iconBg }]}
                >
                  <task.IconComponent color={task.iconTint} size={16} />
                </View>
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskBottom}>
                <View style={styles.taskTimeRow}>
                  <CalendarIcon color="#9CA3AF" size={14} />
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: task.statusBg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: task.statusColor }]}
                  >
                    {task.status}
                  </Text>
                </View>
              </View>
            </View>
            </TouchableOpacity>
          ))}
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
});
