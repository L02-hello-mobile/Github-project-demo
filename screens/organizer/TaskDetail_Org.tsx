import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  ChevronDown,
  Layers,
  Calendar,
  MapPin,
  Users,
  Package,
  Wrench,
  Camera,
  Shield,
  ClipboardList,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import {
  ArrowIcon,
  NotificationIcon,
} from "../../components/Icons";

const { width } = Dimensions.get("window");

const taskIcons: any = {
  logistics: Package,
  technical: Wrench,
  media: Camera,
  security: Shield,
  support: Users,
  management: ClipboardList,
};

const taskOptions = [
  { key: "logistics", label: "Nhóm khu A" },
  { key: "technical", label: "Nhóm kỹ thuật" },
  { key: "media", label: "Media" },
  { key: "security", label: "An ninh" },
  { key: "support", label: "Hỗ trợ" },
  { key: "management", label: "Quản lý" },
];

function getGroupKeyFromLabel(label?: string) {
  return taskOptions.find((item) => item.label === label)?.key || "logistics";
}

function parseDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TaskDetailScreen({ route }: { route?: any }) {
  // Lấy dữ liệu task truyền sang từ màn hình trước (nếu không có thì dùng giá trị mặc định ban đầu)
  const navigation = useNavigation<any>();
  const taskData = route?.params?.task;

  const [group, setGroup] = useState(getGroupKeyFromLabel(taskData?.group));
  const [taskName, setTaskName] = useState(taskData?.title || "Kê bàn");
  const [description, setDescription] = useState(
    taskData?.description || "Sinh viên tình nguyện thực hiện việc kê bàn theo đúng khu vực quy định, số lượng 100 bàn."
  );
  const [startDate, setStartDate] = useState<Date>(
    taskData?.startDate ? parseDate(taskData.startDate) : new Date(2026, 4, 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    taskData?.endDate ? parseDate(taskData.endDate) : new Date(2026, 4, 2)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(false);
  const CurrentIcon = taskIcons[group] || Package;
  const groupLabel = taskOptions.find((item) => item.key === group)?.label || taskData?.group || "Nhóm khu A";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>
          Nhiệm vụ của sự kiện
        </Text>

        <NotificationIcon color="#1F2937" />
      </View>

      {/* Toàn bộ nội dung cuộn */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Chọn Nhóm (Dropdown) */}
        <TouchableOpacity
          style={styles.cardRow}
          onPress={() => setOpenDropdown(!openDropdown)}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FFEBF0" }]}>
            <CurrentIcon size={20} color="#FF5487" />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.label}>Nhóm</Text>

            <Text style={styles.valueText}>{groupLabel}</Text>
          </View>

          <ChevronDown size={20} color="#1A1D1E" />
        </TouchableOpacity>

        {/* Options */}
        {openDropdown && (
          <View style={styles.dropdownContainer}>
            {taskOptions.map((item) => {
              const IconComponent = taskIcons[item.key];

              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGroup(item.key);
                    setOpenDropdown(false);
                  }}
                >
                  <IconComponent size={18} color="#5F33E1" />

                  <Text style={styles.dropdownText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 3. Tên Nhiệm vụ (Input) */}
        <View style={styles.cardField}>
          <Text style={styles.label}>Nhiệm vụ</Text>
          <TextInput
            style={styles.input}
            value={taskName}
            onChangeText={setTaskName}
          />
        </View>

        {/* 4. Mô tả (Multi-line Input) */}
        <View style={styles.cardField}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 5. Ngày bắt đầu */}
        <TouchableOpacity
          style={styles.cardRow}
          onPress={() => setShowStartPicker(true)}
        >
          <View style={styles.cardLeftIconRow}>
            <Calendar size={24} color="#5F33E1" />
            <View style={styles.cardBodyPadding}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <Text style={styles.valueText}>{formatDate(startDate)}</Text>
            </View>
          </View>
          <ChevronDown size={20} color="#1A1D1E" />
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {/* 6. Ngày kết thúc */}
        <TouchableOpacity
          style={styles.cardRow}
          onPress={() => setShowEndPicker(true)}
        >
          <View style={styles.cardLeftIconRow}>
            <Calendar size={24} color="#5F33E1" />
            <View style={styles.cardBodyPadding}>
              <Text style={styles.label}>Ngày kết thúc</Text>
              <Text style={styles.valueText}>{formatDate(endDate)}</Text>
            </View>
          </View>
          <ChevronDown size={20} color="#1A1D1E" />
        </TouchableOpacity>

        {showEndPicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        {/* 7. Gắn vị trí thực hiện */}
        <View style={styles.cardRowBtn}>
          <View style={styles.cardLeftIconRow}>
            <MapPin size={28} color="#5F33E1" />
            <Text style={styles.rowTitle}>Gắn vị trí thực hiện</Text>
          </View>
          <TouchableOpacity style={styles.innerButton} onPress={() => navigation.navigate("MapEditor")}>
            <Text style={styles.innerButtonText}>Thêm vị trí</Text>
          </TouchableOpacity>
        </View>

        {/* 8. Xem thành viên */}
        <View style={styles.cardRowBtn}>
          <View style={styles.cardLeftIconRow}>
            <Users size={28} color="#5F33E1" />
          </View>
          <TouchableOpacity style={styles.innerButton} onPress={() => alert("Sang trang xem danh sách thành viên!")}>
            <Text style={styles.innerButtonText}>Xem thành viên</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 9. Nút Lưu cố định ở đáy màn hình */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFC", // Nền xám cực nhẹ giống trong hình
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#24252C",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1D1E",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notchDot: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5F33E1", // Chấm thông báo tím
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // Cách đáy một khoảng để không bị nút "Lưu" đè lên nội dung
  },
  label: {
    fontSize: 12,
    color: "#8A8D9F",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
    marginLeft: 12,
  },
  // Base Card chung cho các ô dạng bấm chọn (Dropdown, Date)
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
  },
  cardBodyPadding: {
    marginLeft: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLeftIconRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  // Base Card cho ô nhập văn bản (Nhiệm vụ, Mô tả)
  cardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
    padding: 0, // Xóa padding mặc định của TextInput Android
  },
  dateInput: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
    paddingVertical: 0,
  },
  textArea: {
    fontWeight: "400",
    lineHeight: 22,
    textAlignVertical: "top", // Đẩy chữ lên trên cùng đối với Android multiline
  },
  // Card có chứa nút bấm phụ bên phải (Vị trí, Thành viên)
  cardRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  innerButton: {
    backgroundColor: "#EEE9FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  innerButtonText: {
    color: "#5F33E1",
    fontSize: 13,
    fontWeight: "600",
  },
  // Phần nút "Lưu" ở dưới đáy
  bottomAction: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: "#5F33E1",
    width: "100%",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: -10,
    marginBottom: 16,
    paddingVertical: 8,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  dropdownText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1D1E",
  },
});