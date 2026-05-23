import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
  Trash2,
} from "lucide-react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import { taskService } from "../../services/taskService";
import { eventService } from "../../services/eventService";
import { X } from "lucide-react-native";

const { width } = Dimensions.get("window");

const taskIcons: any = {
  logistics: Package,
  technical: Wrench,
  media: Camera,
  security: Shield,
  support: Users,
  management: ClipboardList,
};

const ICON_INDEX_KEYS = [
  "logistics",
  "technical",
  "media",
  "security",
  "support",
  "management",
];

function findGroupKey(
  groupValue: any,
  options: { key: string; label: string; iconKey?: string }[],
) {
  if (!groupValue) return "";
  if (typeof groupValue === "object") {
    if (groupValue._id && options.some((item) => item.key === groupValue._id)) {
      return groupValue._id;
    }
    if (groupValue.name) {
      return (
        options.find((item) => item.label === groupValue.name)?.key ||
        groupValue._id ||
        groupValue.name
      );
    }
  }
  if (typeof groupValue === "string") {
    return (
      options.find(
        (item) => item.key === groupValue || item.label === groupValue,
      )?.key || groupValue
    );
  }
  return "";
}

function getGroupDisplayName(groupValue: any) {
  if (!groupValue) return "";
  if (typeof groupValue === "object") {
    return groupValue.name || groupValue.label || "";
  }
  return String(groupValue);
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

function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

export default function TaskDetailScreen({ route }: { route?: any }) {
  const navigation = useNavigation<any>();
  const taskId: string | undefined = route?.params?.taskId;
  const taskData = route?.params?.task;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState<string>(
    typeof taskData?.event === "string"
      ? taskData.event
      : taskData?.event?._id || "",
  );
  const [assignees, setAssignees] = useState<string[]>(
    taskData?.assignees?.map((a: any) => a._id || a) || [],
  );
  const [eventMembers, setEventMembers] = useState<any[]>([]);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [group, setGroup] = useState("");
  const [groupDisplayName, setGroupDisplayName] = useState(
    getGroupDisplayName(taskData?.group),
  );
  const [taskName, setTaskName] = useState(taskData?.title || "");
  const [description, setDescription] = useState(taskData?.description || "");
  const [startDate, setStartDate] = useState<Date>(
    taskData?.startTime
      ? new Date(taskData.startTime)
      : taskData?.startDate
        ? parseDate(taskData.startDate)
        : new Date(),
  );
  const [endDate, setEndDate] = useState<Date>(
    taskData?.endTime
      ? new Date(taskData.endTime)
      : taskData?.endDate
        ? parseDate(taskData.endDate)
        : new Date(),
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("");
  const [apiGroups, setApiGroups] = useState<
    { key: string; label: string; iconKey: string }[]
  >([]);
  const [customGroups, setCustomGroups] = useState<
    { key: string; label: string; iconKey: string }[]
  >([]);

  const allGroups = [...apiGroups, ...customGroups];

  useFocusEffect(
    useCallback(() => {
      if (!taskId) return;
      setLoading(true);
      taskService
        .getTaskDetail(taskId)
        .then(async (res) => {
          if (!res?.data) return;
          const t = res.data;
          const nextEventId =
            typeof t.event === "string" ? t.event : t.event?._id || "";
          let nextApiGroups: { key: string; label: string; iconKey: string }[] =
            [];

          if (nextEventId) {
            setEventId(nextEventId);
            try {
              const eventRes = await eventService.getEventDetail(nextEventId);
              nextApiGroups = (eventRes?.data?.groups ?? []).map(
                (item: any) => ({
                  key: item._id,
                  label: item.name,
                  iconKey: ICON_INDEX_KEYS[item.iconIndex ?? 0] ?? "logistics",
                }),
              );
              setApiGroups(nextApiGroups);
            } catch {
              setApiGroups([]);
            }
          }

          setTaskName(t.title || "");
          setDescription(t.description || "");
          setGroupDisplayName(getGroupDisplayName(t.group));
          setGroup(findGroupKey(t.group, nextApiGroups));
          if (t.startTime) setStartDate(new Date(t.startTime));
          if (t.endTime) setEndDate(new Date(t.endTime));
          if (t.assignees) {
            setAssignees(t.assignees.map((a: any) => a._id || a));
          }
        })
        .finally(() => setLoading(false));
    }, [taskId]),
  );

  const loadEventMembers = async () => {
    if (!eventId) return;
    setLoadingMembers(true);
    try {
      const res = await eventService.getEventDetail(eventId);
      const data = res.data || res;
      const accepted = (data.members || []).filter(
        (m: any) => m.status === "ACCEPTED",
      );
      setEventMembers(accepted);
    } catch {
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const addCustomGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    const key = `custom_${Date.now()}`;
    setCustomGroups([
      ...customGroups,
      { key, label: trimmed, iconKey: newGroupIcon || "logistics" },
    ]);
    taskIcons[key] = taskIcons[newGroupIcon];
    setGroup(key);
    setNewGroupName("");
    setNewGroupIcon("logistics");
    setShowAddGroup(false);
    setOpenDropdown(false);
  };

  const handleSave = async () => {
    if (!taskId) return;
    if (!group) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn hoặc tạo nhóm.");
      return;
    }
    setSaving(true);
    try {
      const selectedGroup = allGroups.find((g) => g.key === group);
      const isObjectId = /^[a-f\d]{24}$/i.test(group);
      const res = await taskService.updateTask(taskId, {
        title: taskName.trim(),
        group: isObjectId ? group : selectedGroup?.label || group,
        description: description.trim() || undefined,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      if (res?.data?._id || res?.success !== false) {
        await taskService.assignTask(taskId, { assignees });
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", res?.message || "Không thể lưu nhiệm vụ");
      }
    } catch {
      Alert.alert("Lỗi", "Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!taskId) return;
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa nhiệm vụ này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await taskService.deleteTask(taskId);
            navigation.goBack();
          } catch {
            Alert.alert("Lỗi", "Không thể xóa nhiệm vụ");
          }
        },
      },
    ]);
  };

  const CurrentIcon =
    taskIcons[allGroups.find((item) => item.key === group)?.iconKey ?? group] ||
    Package;
  const groupLabel =
    allGroups.find((item) => item.key === group)?.label ||
    groupDisplayName ||
    "Chọn nhóm...";

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#5F33E1" />
        </View>
      ) : (
        <>
          {/* 1. Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <ArrowIcon color="#1F2937" size={22} />
              </View>
            </TouchableOpacity>

            <Text style={styles.title}>Nhiệm vụ của sự kiện</Text>

            <TouchableOpacity onPress={handleDelete}>
              <Trash2 size={22} color="#EF4444" />
            </TouchableOpacity>
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
              <View
                style={[styles.iconContainer, { backgroundColor: "#FFEBF0" }]}
              >
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
                {allGroups.map((item) => {
                  const IconComponent =
                    taskIcons[item.iconKey ?? item.key] || Package;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGroup(item.key);
                        setOpenDropdown(false);
                        setShowAddGroup(false);
                      }}
                    >
                      <IconComponent size={18} color="#5F33E1" />
                      <Text style={styles.dropdownText}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Divider */}
                <View style={styles.dropdownDivider} />

                {/* Add custom group */}
                {!showAddGroup ? (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => setShowAddGroup(true)}
                  >
                    <View style={styles.addGroupIconCircle}>
                      <Text style={styles.addGroupPlus}>+</Text>
                    </View>
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: "#5F33E1", fontWeight: "600" },
                      ]}
                    >
                      Thêm nhóm mới
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.addGroupForm}>
                    <TextInput
                      style={styles.addGroupInput}
                      placeholder="Tên nhóm..."
                      placeholderTextColor="#B0AEC8"
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                      autoFocus
                    />
                    {/* Icon picker */}
                    <Text style={styles.addGroupIconLabel}>Chọn icon:</Text>
                    <View style={styles.iconPickerRow}>
                      {Object.entries(taskIcons)
                        .filter(([k]) => !k.startsWith("custom_"))
                        .map(([iconKey, IconComp]: [string, any]) => (
                          <TouchableOpacity
                            key={iconKey}
                            style={[
                              styles.iconPickerItem,
                              newGroupIcon === iconKey &&
                                styles.iconPickerItemActive,
                            ]}
                            onPress={() => setNewGroupIcon(iconKey)}
                          >
                            <IconComp
                              size={20}
                              color={
                                newGroupIcon === iconKey ? "#fff" : "#5F33E1"
                              }
                            />
                          </TouchableOpacity>
                        ))}
                    </View>
                    {/* Confirm / Cancel */}
                    <View style={styles.addGroupActions}>
                      <TouchableOpacity
                        style={styles.addGroupCancel}
                        onPress={() => {
                          setShowAddGroup(false);
                          setNewGroupName("");
                        }}
                      >
                        <Text style={styles.addGroupCancelText}>Huỷ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addGroupConfirm}
                        onPress={addCustomGroup}
                      >
                        <Text style={styles.addGroupConfirmText}>Thêm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
            <View style={styles.cardRow}>
              <View style={styles.cardLeftIconRow}>
                <Calendar size={24} color="#5F33E1" />
                <View style={styles.cardBodyPadding}>
                  <Text style={styles.label}>Ngày bắt đầu</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                      <Text style={[styles.valueText, { color: "#5F33E1" }]}>
                        {formatDate(startDate)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Text style={[styles.valueText, { color: "#5F33E1" }]}>
                        {formatTime(startDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <ChevronDown size={20} color="#1A1D1E" />
            </View>

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

            {showStartTimePicker && (
              <DateTimePicker
                value={startDate}
                mode="time"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowStartTimePicker(false);
                  if (selectedDate) {
                    const merged = new Date(startDate);
                    merged.setHours(
                      selectedDate.getHours(),
                      selectedDate.getMinutes(),
                      0,
                      0,
                    );
                    setStartDate(merged);
                  }
                }}
              />
            )}

            {/* 6. Ngày kết thúc */}
            <View style={styles.cardRow}>
              <View style={styles.cardLeftIconRow}>
                <Calendar size={24} color="#5F33E1" />
                <View style={styles.cardBodyPadding}>
                  <Text style={styles.label}>Ngày kết thúc</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                      <Text style={[styles.valueText, { color: "#5F33E1" }]}>
                        {formatDate(endDate)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Text style={[styles.valueText, { color: "#5F33E1" }]}>
                        {formatTime(endDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <ChevronDown size={20} color="#1A1D1E" />
            </View>

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

            {showEndTimePicker && (
              <DateTimePicker
                value={endDate}
                mode="time"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowEndTimePicker(false);
                  if (selectedDate) {
                    const merged = new Date(endDate);
                    merged.setHours(
                      selectedDate.getHours(),
                      selectedDate.getMinutes(),
                      0,
                      0,
                    );
                    setEndDate(merged);
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
              <TouchableOpacity
                style={styles.innerButton}
                onPress={() => navigation.navigate("MapEditor", { taskId })}
              >
                <Text style={styles.innerButtonText}>Thêm vị trí</Text>
              </TouchableOpacity>
            </View>

            {/* 8. Phân công thành viên */}
            <View style={styles.cardRowBtn}>
              <View style={styles.cardLeftIconRow}>
                <Users size={28} color="#5F33E1" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.rowTitle}>Phân công</Text>
                  {assignees.length > 0 && (
                    <Text
                      style={{ fontSize: 12, color: "#8A8D9F", marginTop: 2 }}
                    >
                      {assignees.length} thành viên đã chọn
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.innerButton}
                onPress={() => {
                  loadEventMembers();
                  setShowAssigneePicker(true);
                }}
              >
                <Text style={styles.innerButtonText}>Chọn</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 9. Nút Lưu cố định ở đáy màn hình */}
          <View style={styles.bottomAction}>
            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              disabled={saving}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Assignee Picker Modal */}
      <Modal visible={showAssigneePicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn thành viên phân công</Text>
              <TouchableOpacity onPress={() => setShowAssigneePicker(false)}>
                <X size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {loadingMembers ? (
              <ActivityIndicator
                color="#5F33E1"
                style={{ marginVertical: 24 }}
              />
            ) : eventMembers.length === 0 ? (
              <Text style={styles.noMemberText}>
                {eventId
                  ? "Chưa có thành viên đã xác nhận trong sự kiện."
                  : "Không tìm thấy sự kiện."}
              </Text>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 360 }}
              >
                {eventMembers.map((m: any) => {
                  const userId = m.user?._id;
                  const name =
                    m.user?.fullName || m.user?.email || "Thành viên";
                  const selected = assignees.includes(userId);
                  return (
                    <TouchableOpacity
                      key={userId}
                      style={styles.memberPickerRow}
                      onPress={() => toggleAssignee(userId)}
                    >
                      <View
                        style={[
                          styles.checkCircle,
                          selected && styles.checkCircleActive,
                        ]}
                      >
                        {selected && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                      <Text style={styles.memberPickerName}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.pickerConfirmBtn}
              onPress={() => setShowAssigneePicker(false)}
            >
              <Text style={styles.pickerConfirmText}>
                Xác nhận ({assignees.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#5F33E1",
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
  deleteButton: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    marginRight: 12,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
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

  dropdownDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginVertical: 4,
  },

  addGroupIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#5F33E1",
    justifyContent: "center",
    alignItems: "center",
  },

  addGroupPlus: {
    fontSize: 18,
    color: "#5F33E1",
    lineHeight: 22,
  },

  addGroupForm: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },

  addGroupInput: {
    borderWidth: 1,
    borderColor: "#DDD8F8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1A1D1E",
    marginBottom: 10,
  },

  addGroupIconLabel: {
    fontSize: 12,
    color: "#8A8D9F",
    marginBottom: 8,
  },

  iconPickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  iconPickerItem: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#DDD8F8",
    justifyContent: "center",
    alignItems: "center",
  },

  iconPickerItemActive: {
    backgroundColor: "#5F33E1",
    borderColor: "#5F33E1",
  },

  addGroupActions: {
    flexDirection: "row",
    gap: 10,
  },

  addGroupCancel: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  addGroupCancelText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  addGroupConfirm: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#5F33E1",
    alignItems: "center",
  },

  addGroupConfirmText: {
    fontSize: 14,
  },

  // Assignee picker
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pickerSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D1E",
  },
  noMemberText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 24,
  },
  memberPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkCircleActive: {
    backgroundColor: "#5F33E1",
    borderColor: "#5F33E1",
  },
  checkMark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  memberPickerName: {
    fontSize: 15,
    color: "#1A1D1E",
    fontWeight: "500",
  },
  pickerConfirmBtn: {
    backgroundColor: "#5F33E1",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  pickerConfirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
