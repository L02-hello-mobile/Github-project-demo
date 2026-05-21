import React, { useState, useRef, useCallback, useEffect } from "react";
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
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Search, ChevronDown, Package, Wrench, Camera, Shield, Users, ClipboardList } from "lucide-react-native";
import ArrowIcon from "../components/Icon/LeftArrow";
import BellIcon from "../components/Icon/Notification";
import ClockIcon from "../components/Icon/Clock";
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

const taskIcons: any = {
  logistics: Package,
  technical: Wrench,
  media: Camera,
  security: Shield,
  support: Users,
  management: ClipboardList,
};

const FILTERS = ["Tất cả", "Cần làm", "Đang làm", "Hoàn thành"];

const TASKS = [
  {
    category: "Nhóm kỹ thuật",
    title: "Kê bàn",
    time: "10:00 AM",
    status: "Hoàn thành",
    statusColor: "#6366F1",
    statusBg: "#EEF2FF",
    icon: "technical",
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
  },
  {
    category: "Nhóm media",
    title: "Chụp ảnh khách",
    time: "12:00 PM",
    status: "Đang làm",
    statusColor: "#F97316",
    statusBg: "#FFEDD5",
    icon: "media",
    iconBg: "#FFEDD5",
    iconColor: "#F97316",
  },
  {
    category: "Nhóm an ninh",
    title: "Soát vé tại cổng chính",
    time: "07:00 PM",
    status: "Cần làm",
    statusColor: "#8B5CF6",
    statusBg: "#F5F3FF",
    icon: "security",
    iconBg: "#F5F3FF",
    iconColor: "#8B5CF6",
  },
];

const groups = [
  "Nhóm",
  ...Array.from(new Set(TASKS.map((task) => task.category))),
];

export default function EventTasks({ navigation }: any) {
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Nhóm");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width),
  ).current;
  const flatListRef = useRef<FlatList>(null);

  const filteredTasks = TASKS.filter((task) => {
    const searchText = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      task.title.toLowerCase().includes(searchText) ||
      task.category.toLowerCase().includes(searchText);
    const matchesGroup =
      selectedGroup === "Nhóm" || task.category === selectedGroup;
    const matchesFilter =
      activeFilter === "Tất cả" ||
      task.status === activeFilter;

    return matchesSearch && matchesGroup && matchesFilter;
  });

  // Scroll so selected item is centered (2nd of 5 visible = index 2)
  const scrollToIndex = (index: number) => {
    const screenWidth = Dimensions.get("window").width - 48; // paddingHorizontal 24*2
    const offset = index * ITEM_WIDTH - screenWidth / 2 + ITEM_WIDTH / 2;
    flatListRef.current?.scrollToOffset({
      offset: Math.max(0, offset),
      animated: true,
    });
  };

  useFocusEffect(
    useCallback(() => {
      slideAnim.setValue(Dimensions.get("window").width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scroll to today on focus
      setTimeout(() => scrollToIndex(TODAY_INDEX), 350);
    }, []),
  );

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
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowIcon size={25} color="#24252C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhiệm vụ của sự kiện</Text>
          <TouchableOpacity onPress={() => alert("Đi tới màn hình thông báo!")}>
            <BellIcon size={25} color="#24252C" hasNotification={true} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollArea}
          style={styles.scrollView}
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
            initialScrollIndex={TODAY_INDEX}
            // Snap so 5 days are visible and selected is centered
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

          {/* Search + Group */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm"
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Search size={20} color="#8E8E93" />
            </View>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {selectedGroup}
                </Text>
                <ChevronDown size={18} color="#8E8E93" />
                <View style={styles.dropdownUnderline} />
              </TouchableOpacity>

              {isMenuOpen && (
                <View style={styles.menuBox}>
                  {groups.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.menuItem}
                      onPress={() => {
                        setSelectedGroup(item);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          selectedGroup === item && {
                            color: "#5F33E1",
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Tasks */}
          {filteredTasks.map((task, i) => {
            const IconComponent = taskIcons[task.icon];
            return (
              <TouchableOpacity
                key={i}
                style={styles.taskCard}
                onPress={() =>
                  navigation.navigate("TaskDetail", {
                    task: {
                      ...task,
                      group: task.category,
                    },
                  })
                }
              >
                <View>
                  <View style={styles.taskTop}>
                    <Text style={styles.taskCategory}>{task.category}</Text>
                    <View
                      style={[styles.taskIconBox, { backgroundColor: task.iconBg }]}
                    >
                      <IconComponent size={16} color={task.iconColor} />
                    </View>
                  </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskBottom}>
                  <View style={styles.taskTimeRow}>
                    <ClockIcon size={14} color="#9CA3AF" />
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
            );
          })}
        </ScrollView>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%", overflow: "visible" },
  container: { flex: 1, paddingTop: 56, overflow: "visible" },
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
  scrollView: { overflow: "visible" },

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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    overflow: "visible",
    zIndex: 1000,
  },
  searchContainer: {
    flex: 1.6,
    height: 44,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  dropdownWrapper: {
    flex: 1,
    position: "relative",
    overflow: "visible",
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: "#24252C",
    fontFamily: "LexendDeca_400Regular",
  },
  dropdownUnderline: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#8E8E93",
  },
  menuBox: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 5,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 14,
    color: "#24252C",
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
    zIndex: 0,
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
