import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";

// Đảm bảo đã chạy: npx expo install lucide-react-native
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

import ArrowIcon from "../components/Icon/LeftArrow";
import BellIcon from "../components/Icon/Notification";
import ClockIcon from "../components/Icon/Clock";
import BottomNavigation from "../components/Icon/BottomNavigation";
import TaskDetailScreen  from "./TaskDetail_Org";

const { width, height } = Dimensions.get("window");

// ======================
// ICON MAP
// ======================

const taskIcons: any = {
  logistics: Package,
  technical: Wrench,
  media: Camera,
  security: Shield,
  support: Users,
  management: ClipboardList,
};

// --- Định nghĩa kiểu dữ liệu ---
interface DayItem {
  month: string;
  day: string;
  weekday: string;
  isToday: boolean;
}

// --- Helper Functions ---
function generateDays(startDate: Date, endDate: Date): DayItem[] {
  const days: DayItem[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const weekday = current.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const month = current.toLocaleDateString("en-US", {
      month: "short",
    });

    days.push({
      month,
      day: current.getDate().toString(),
      weekday,
      isToday:
        current.toDateString() === new Date().toDateString(),
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

interface TaskProps {
  group: string;
  title: string;
  time: string;
  status: "Hoàn thành" | "Đang làm";
  icon: keyof typeof taskIcons;
}

const TaskCard = ({
  group,
  title,
  time,
  status,
  icon,
}: TaskProps) => {

  const isDone = status === "Hoàn thành";

  const IconComponent = taskIcons[icon];

  return (
    <View style={styles.card}>
      {/* Cột trái */}
      <View style={styles.cardContent}>
        <Text style={styles.groupText}>{group}</Text>

        <Text style={styles.taskTitle}>
          {title}
        </Text>

        <View style={styles.timeContainer}>
          <ClockIcon size={16} />

          <Text style={styles.timeText}>
            {time}
          </Text>
        </View>
      </View>

      {/* Cột phải */}
      <View style={styles.rightColumn}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isDone
                ? "#FFEBFA"
                : "#F0EEFF",
            },
          ]}
        >
          <IconComponent
            size={18}
            color={
              isDone
                ? "#FF4FC3"
                : "#5F33E1"
            }
          />
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isDone
                ? "#F0EEFF"
                : "#FFF0E6",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isDone
                  ? "#5F33E1"
                  : "#FF8A00",
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

// --- Dữ liệu khởi tạo ---
const startDate = new Date(2026, 4, 1);
const endDate = new Date(2026, 4, 15);

const daysData = generateDays(startDate, endDate);

const todayIndex = daysData.findIndex(
  (d) => d.isToday
);

const filters = [
  "Tất cả",
  "Cần làm",
  "Đang làm",
  "Hoàn thành",
  "Trễ hạn",
];

const groups = [
  "Nhóm",
  "Nhóm khu A",
  "Nhóm kỹ thuật",
  "Media",
];

const tasks = [
  {
    id: "1",
    group: "Nhóm khu A",
    title: "Kê bàn",
    time: "10:00 AM",
    status: "Hoàn thành",
    icon: "logistics",
  },
  {
    id: "2",
    group: "Nhóm kỹ thuật",
    title: "Kiểm tra âm thanh",
    time: "10:30 AM",
    status: "Đang làm",
    icon: "technical",
  },
  {
    id: "3",
    group: "Media",
    title: "Chụp ảnh khách",
    time: "02:00 PM",
    status: "Đang làm",
    icon: "media",
  },
  {
    id: "3",
    group: "Media",
    title: "Chụp ảnh khách",
    time: "02:00 PM",
    status: "Đang làm",
    icon: "media",
  },
];

export default function StartScreen({
  navigation,
}: {
  navigation: any;
}) {

  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    if (todayIndex !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    }
  }, []);

  const [selectedFilter, setSelectedFilter] =
    useState("Tất cả");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedGroup, setSelectedGroup] =
    useState("Nhóm");

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowIcon size={0.07 * width} color="#24252C" />
        </TouchableOpacity>

        <Text style={styles.title}>
          Nhiệm vụ của sự kiện
        </Text>

        <TouchableOpacity onPress={() => alert("Đi tới màn hình thông báo!")}>
          <BellIcon size={0.07 * width} color="#24252C" hasNotification={true} />
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
        {/* Calendar */}
        <FlatList
          ref={flatListRef}
          data={daysData}
          horizontal
          keyExtractor={(_, index) =>
            index.toString()
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.calendarContent
          }
          renderItem={({
            item,
          }: {
            item: DayItem;
          }) => (
            <TouchableOpacity onPress={() => console.log("Chọn ngày:", item.day)}>
            <View
              style={
                item.isToday
                  ? styles.today
                  : styles.rectangle
              }
            >
              <Text
                style={
                  item.isToday
                    ? styles.monthWhite
                    : styles.month
                }
              >
                {item.month}
              </Text>

              <Text
                style={
                  item.isToday
                    ? styles.dayWhite
                    : styles.day
                }
              >
                {item.day}
              </Text>

              <Text
                style={
                  item.isToday
                    ? styles.weekdayWhite
                    : styles.weekday
                }
              >
                {item.weekday}
              </Text>
            </View>
            </TouchableOpacity>
          )}
        />

        {/* Filter */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.filterContent
            }
          >
            {filters.map((filter: string) => (
              <TouchableOpacity
                key={filter}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                style={[
                  styles.filterButton,
                  selectedFilter === filter &&
                    styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />

            <Search
              size={20}
              color="#8E8E93"
            />
          </View>

          {/* Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() =>
                setIsMenuOpen(!isMenuOpen)
              }
              activeOpacity={0.7}
            >
              <Text
                style={styles.dropdownText}
                numberOfLines={1}
              >
                {selectedGroup}
              </Text>

              <ChevronDown
                size={18}
                color="#8E8E93"
              />

              <View
                style={styles.dropdownUnderline}
              />
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
      </View>

      {/* Task List */}
      <View style={styles.taskListArea}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("TaskDetail", { task: item })} >
              <TaskCard
                group={item.group}
                title={item.title}
                time={item.time}
                status={item.status as any}
                icon={item.icon as any}
              />
            </TouchableOpacity>
          )}
        />
      </View>
      <BottomNavigation/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    marginVertical: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#24252C",
  },

  topSection: {
    zIndex: 10,
    marginBottom: 5,
  },

  calendarContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 10,
  },

  rectangle: {
    width: width * 0.16,
    height: height * 0.12,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  today: {
    width: width * 0.16,
    height: height * 0.12,
    borderRadius: 15,
    backgroundColor: "#5F33E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  day: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  month: {
    fontSize: 12,
    color: "#777",
  },

  weekday: {
    fontSize: 12,
    color: "#777",
  },

  dayWhite: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },

  monthWhite: {
    fontSize: 12,
    color: "#FFF",
  },

  weekdayWhite: {
    fontSize: 12,
    color: "#FFF",
  },

  filterWrapper: {
    marginTop: 10,
  },

  filterContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 5,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#DDD5F3",
    marginRight: 10,
  },

  filterButtonActive: {
    backgroundColor: "#5F33E1",
  },

  filterText: {
    color: "#5F33E1",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFF",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    marginTop: 15,
    zIndex: 20,
  },

  searchContainer: {
    flex: 1.6,
    height: height * 0.05,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    marginRight: 15,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    ...({ outlineStyle: "none" } as any),
  },

  dropdownWrapper: {
    flex: 1,
    position: "relative",
  },

  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },

  dropdownText: {
    fontSize: 14,
    color: "#24252C",
    fontWeight: "500",
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
    top: 45,
    right: 0,
    width: width * 0.4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  menuItemText: {
    fontSize: 14,
    color: "#24252C",
  },

  taskListArea: {
    flex: 1,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  cardContent: {
    flex: 1,
  },

  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    minHeight: 60,
  },

  groupText: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#24252C",
    marginBottom: 12,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#AB94FF",
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});