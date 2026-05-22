import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Animated,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";
import {
  Search,
  ChevronDown,
  Package,
  Wrench,
  Camera,
  Shield,
  Users,
  ClipboardList,
} from "lucide-react-native";

import {
  ArrowIcon,
  CalendarIcon,
  NotificationIcon,
} from "../../components/Icons";


// ======================
// CONSTANTS
// ======================

const ITEM_WIDTH = 64;

const generateDays = () => {
  const days: {
    day: string;
    date: number;
    month: string;
    fullDate: string;
    isToday: boolean;
    offset: number;
  }[] = [];
  const today = new Date();
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  for (let i = -30; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      fullDate: d.toDateString(),
      isToday: i === 0,
      offset: i,
    });
  }
  return days;
};

const ALL_DAYS = generateDays();
const TODAY_INDEX = 30;

const taskIcons: any = {
  logistics: Package,
  technical: Wrench,
  media: Camera,
  security: Shield,
  support: Users,
  management: ClipboardList,
};

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "Hoàn thành": { color: "#6366F1", bg: "#EEF2FF" },
  "Đang làm": { color: "#F97316", bg: "#FFEDD5" },
  "Cần làm": { color: "#8B5CF6", bg: "#F5F3FF" },
  "Trễ hạn": { color: "#EF4444", bg: "#FEE2E2" },
};

const FILTERS = ["Tất cả", "Cần làm", "Đang làm", "Hoàn thành", "Trễ hạn"];

const groups = ["Nhóm", "Nhóm khu A", "Nhóm kỹ thuật", "Media"];

const tasks = [
  { id: "1", group: "Nhóm khu A", title: "Kê bàn", time: "10:00 AM", status: "Hoàn thành", icon: "logistics" },
  { id: "2", group: "Nhóm kỹ thuật", title: "Kiểm tra âm thanh", time: "10:30 AM", status: "Đang làm", icon: "technical" },
  { id: "3", group: "Media", title: "Chụp ảnh khách", time: "02:00 PM", status: "Cần làm", icon: "media" },
  { id: "4", group: "Media", title: "Quay video sự kiện", time: "04:00 PM", status: "Trễ hạn", icon: "media" },
];

// ======================
// MAIN SCREEN
// ======================

export default function EventsTasksOrg({ navigation }: { navigation: any }) {
  const isFocused = useIsFocused();
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Nhóm");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(Dimensions.get("window").width)).current;
  const flatListRef = useRef<FlatList>(null);

  const scrollToIndex = (index: number) => {
    const screenWidth = Dimensions.get("window").width - 48;
    const offset = index * ITEM_WIDTH - screenWidth / 2 + ITEM_WIDTH / 2;
    flatListRef.current?.scrollToOffset({ offset: Math.max(0, offset), animated: true });
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

  const filteredTasks = tasks.filter((t) => {
    const matchFilter = activeFilter === "Tất cả" || t.status === activeFilter;
    const matchGroup = selectedGroup === "Nhóm" || t.group === selectedGroup;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchGroup && matchSearch;
  });

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
        <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>{item.month}</Text>
        <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>{item.date}</Text>
        <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>{item.day}</Text>
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
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <ArrowIcon color="#1F2937" size={22} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhiệm vụ của sự kiện</Text>
          <NotificationIcon color="#1F2937" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollArea}
        >
          {/* Date Picker */}
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
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
          />

          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, f === activeFilter && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, f === activeFilter && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search + Group dropdown */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              <Search size={18} color="#9CA3AF" />
            </View>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText} numberOfLines={1}>{selectedGroup}</Text>
                <ChevronDown size={16} color="#6B7280" />
                <View style={styles.dropdownUnderline} />
              </TouchableOpacity>

              {isMenuOpen && (
                <View style={styles.menuBox}>
                  {groups.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.menuItem}
                      onPress={() => { setSelectedGroup(item); setIsMenuOpen(false); }}
                    >
                      <Text style={[styles.menuItemText, selectedGroup === item && { color: "#5F33E1", fontWeight: "700" }]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Task cards */}
          {filteredTasks.map((task) => {
            const s = STATUS_STYLES[task.status] ?? { color: "#6B7280", bg: "#F3F4F6" };
            const IconComponent = taskIcons[task.icon];
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("TaskDetail", { task })}
              >
                <View style={styles.taskTop}>
                  <Text style={styles.taskCategory}>{task.group}</Text>
                  <View style={[styles.taskIconBox, { backgroundColor: s.bg }]}>
                    <IconComponent size={16} color={s.color} />
                  </View>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskBottom}>
                  <View style={styles.taskTimeRow}>
                    <CalendarIcon color="#9CA3AF" size={14} />
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{task.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Thêm nhiệm vụ button - cố định ở đáy */}
      <View style={styles.addBtnWrapper}>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>Thêm nhiệm vụ</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },

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
  },
  dateCellActive: { backgroundColor: "#5F33E1" },
  dateMonth: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  dateNum: { fontSize: 20, fontWeight: "bold", color: "#1F2937", marginBottom: 2 },
  dateDay: { fontSize: 11, color: "#9CA3AF" },
  dateTextActive: { color: "#FFFFFF" },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5F33E1",
    marginTop: 3,
  },

  // Filter
  filterRow: { marginBottom: 16 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#EDE8FF",
  },
  filterBtnActive: { backgroundColor: "#5F33E1" },
  filterText: { fontSize: 14, color: "#5F33E1" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "700" },

  // Search row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 20,
  },
  searchContainer: {
    flex: 1.6,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    ...({ outlineStyle: "none" } as any),
  },
  dropdownWrapper: { flex: 1, position: "relative" },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownText: { fontSize: 14, color: "#1F2937", flex: 1 },
  dropdownUnderline: {},
  menuBox: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 100,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 14, color: "#1F2937" },

  // Task cards
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskCategory: { fontSize: 12, color: "#9CA3AF" },
  taskIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
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
  taskTime: { fontSize: 13, color: "#9CA3AF" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: "700" },

  // Add button
  addBtnWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  addBtn: {
    backgroundColor: "#5F33E1",
    borderRadius: 30,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
  },
});