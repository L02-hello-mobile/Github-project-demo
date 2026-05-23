import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  ChevronDown,
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
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import { taskService } from "../../services/taskService";
import { eventService } from "../../services/eventService";
import { useSocketNotification } from "../../context/SocketNotificationContext";

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

const AVATAR_COLORS = ["#7C6FF7", "#4DB6AC", "#66BB6A", "#FF8A65", "#42A5F5"];

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

export default function AddTask({ route }: { route?: any }) {
  const { unreadCount } = useSocketNotification();
  const navigation = useNavigation<any>();
  const eventId: string | undefined = route?.params?.eventId;

  const [group, setGroup] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("logistics");
  const [apiGroups, setApiGroups] = useState<
    { key: string; label: string; iconKey: string }[]
  >([]);
  const [customGroups, setCustomGroups] = useState<
    { key: string; label: string; iconKey: string }[]
  >([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [selectedAssigneeObjs, setSelectedAssigneeObjs] = useState<any[]>([]);
  const [mapCoordinates, setMapCoordinates] = useState<any>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    eventService.getEventDetail(eventId).then((res) => {
      if (res?.data?.groups) {
        setApiGroups(
          res.data.groups.map((g: any) => ({
            key: g._id,
            label: g.name,
            iconKey: ICON_INDEX_KEYS[g.iconIndex ?? 0] ?? "logistics",
          })),
        );
        if (res.data.groups.length > 0) {
          setGroup(res.data.groups[0]._id);
        }
      }
    });
  }, [eventId]);

  useEffect(() => {
    if (route?.params?.mapCoordinates) {
      setMapCoordinates(route.params.mapCoordinates);
    }
    if (route?.params?.selectedAssignees) {
      const objs = route.params.selectedAssignees;
      setSelectedAssigneeObjs(objs);
      setAssigneeIds(
        objs.map((m: any) => m.user?._id || m._id || m.id).filter(Boolean),
      );
    }
  }, [route?.params?.mapCoordinates, route?.params?.selectedAssignees]);

  const allGroups = [...apiGroups, ...customGroups];

  const addCustomGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (eventId) {
      try {
        const iconIndex = ICON_INDEX_KEYS.indexOf(newGroupIcon);
        const res = await eventService.createGroup(eventId, {
          name: trimmed,
          iconIndex: iconIndex >= 0 ? iconIndex : 0,
        });
        if (res?.data?._id) {
          const newGroup = {
            key: res.data._id,
            label: trimmed,
            iconKey: newGroupIcon,
          };
          taskIcons[res.data._id] = taskIcons[newGroupIcon];
          setApiGroups([...apiGroups, newGroup]);
          setGroup(res.data._id);
        }
      } catch {
        Alert.alert("Lỗi", "Không thể tạo nhóm");
      }
    } else {
      const key = `custom_${Date.now()}`;
      taskIcons[key] = taskIcons[newGroupIcon];
      setCustomGroups([
        ...customGroups,
        { key, label: trimmed, iconKey: newGroupIcon },
      ]);
      setGroup(key);
    }
    setNewGroupName("");
    setNewGroupIcon("logistics");
    setShowAddGroup(false);
    setOpenDropdown(false);
  };

  // Only used to distinguish API ObjectId group keys from local fallback keys (e.g. "logistics")
  const isObjectId = (val: string) => /^[a-f\d]{24}$/i.test(val);

  const currentGroup = allGroups.find((item) => item.key === group);
  const CurrentIcon = taskIcons[currentGroup?.iconKey ?? group] || Package;
  const groupLabel = currentGroup?.label ?? "Chọn nhóm...";

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhiệm vụ");
      return;
    }
    if (!eventId) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy sự kiện. Vui lòng quay lại và thử lại.",
      );
      return;
    }
    if (assigneeIds.length === 0) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn ít nhất một thành viên thực hiện nhiệm vụ",
      );
      return;
    }
    setSubmitting(true);
    try {
      const payload: Parameters<typeof taskService.createTask>[0] = {
        event: eventId,
        title: taskName.trim(),
        description,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        assignees: assigneeIds,
      };
      if (isObjectId(group)) payload.group = group;
      if (mapCoordinates) payload.mapCoordinates = mapCoordinates;
      const res = await taskService.createTask(payload);
      if (res?.data) {
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", res?.message || "Không thể tạo nhiệm vụ");
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Lỗi kết nối server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Thêm nhiệm vụ</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Group dropdown */}
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

        {openDropdown && (
          <View style={styles.dropdownContainer}>
            {allGroups.map((item) => {
              const IconComponent =
                taskIcons[(item as any).iconKey ?? item.key] || Package;
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

            <View style={styles.dropdownDivider} />

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
                          color={newGroupIcon === iconKey ? "#fff" : "#5F33E1"}
                        />
                      </TouchableOpacity>
                    ))}
                </View>
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

        {/* Task name */}
        <View style={styles.cardField}>
          <Text style={styles.label}>Tên nhiệm vụ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên nhiệm vụ..."
            placeholderTextColor="#B0AEC8"
            value={taskName}
            onChangeText={setTaskName}
          />
        </View>

        {/* Description */}
        <View style={styles.cardField}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả..."
            placeholderTextColor="#B0AEC8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Start date */}
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
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
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
            value={startDate}
            mode="date"
            display="default"
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate}
            mode="time"
            display="default"
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              setShowStartTimePicker(false);
              if (d) {
                const merged = new Date(startDate);
                merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
                setStartDate(merged);
              }
            }}
          />
        )}

        {/* End date */}
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
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
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
            value={endDate}
            mode="date"
            display="default"
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endDate}
            mode="time"
            display="default"
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              setShowEndTimePicker(false);
              if (d) {
                const merged = new Date(endDate);
                merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
                setEndDate(merged);
              }
            }}
          />
        )}

        {/* Location */}
        <View style={styles.cardRowBtn}>
          <View style={styles.cardLeftIconRow}>
            <MapPin size={28} color="#5F33E1" />
            <Text style={styles.rowTitle}>Gắn vị trí thực hiện</Text>
          </View>
          <TouchableOpacity
            style={styles.innerButton}
            onPress={() =>
              navigation.navigate("MapEditor", {
                eventId,
                existingCoords: mapCoordinates,
              })
            }
          >
            <Text style={styles.innerButtonText}>
              {mapCoordinates ? "Sửa vị trí" : "Thêm vị trí"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Members — required */}
        <TouchableOpacity
          style={[
            styles.cardField,
            assigneeIds.length === 0 && styles.cardFieldRequired,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("MemberList", {
              eventId,
              mode: "select",
              preSelected: selectedAssigneeObjs,
            })
          }
        >
          <View style={styles.memberCardHeader}>
            <View style={styles.cardLeftIconRow}>
              <Users
                size={18}
                color={assigneeIds.length === 0 ? "#E53E3E" : "#5F33E1"}
              />
              <Text
                style={[
                  styles.memberCardTitle,
                  assigneeIds.length === 0 && { color: "#E53E3E" },
                ]}
              >
                Người thực hiện <Text style={{ color: "#E53E3E" }}>*</Text>
              </Text>
            </View>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeTxt}>
                {assigneeIds.length > 0 ? "Sửa" : "Chọn"}
              </Text>
            </View>
          </View>

          {selectedAssigneeObjs.length > 0 ? (
            <View style={styles.assigneeChips}>
              {selectedAssigneeObjs.map((m, i) => {
                const name =
                  m.user?.fullName ||
                  m.user?.email ||
                  m.fullName ||
                  m.email ||
                  "?";
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <View
                    key={m.user?._id || m._id || i}
                    style={[
                      styles.assigneeChip,
                      { backgroundColor: color + "22" },
                    ]}
                  >
                    <View
                      style={[
                        styles.assigneeAvatar,
                        { backgroundColor: color },
                      ]}
                    >
                      <Text style={styles.assigneeAvatarTxt}>
                        {name[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.assigneeChipName} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.assigneePlaceholder}>
              Chưa chọn — bắt buộc phải có người thực hiện
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Save button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.saveButton, submitting && { opacity: 0.7 }]}
          disabled={submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>
            {submitting ? "Đang tạo..." : "Tạo nhiệm vụ"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFC",
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
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
  cardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  cardFieldRequired: {
    borderWidth: 1.5,
    borderColor: "#FECACA",
    backgroundColor: "#FFF5F5",
  },
  memberCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  memberCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1D1E",
    marginLeft: 8,
  },
  editBadge: {
    backgroundColor: "#EEE9FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  editBadgeTxt: {
    color: "#5F33E1",
    fontSize: 12,
    fontWeight: "600",
  },
  assigneeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assigneeChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    maxWidth: 160,
  },
  assigneeAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  assigneeAvatarTxt: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  assigneeChipName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1A1D1E",
    flexShrink: 1,
  },
  assigneePlaceholder: {
    fontSize: 13,
    color: "#E53E3E",
    fontStyle: "italic",
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
    padding: 0,
  },
  textArea: {
    fontWeight: "400",
    lineHeight: 22,
    textAlignVertical: "top",
    minHeight: 72,
  },
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
    color: "#fff",
    fontWeight: "600",
  },
});
