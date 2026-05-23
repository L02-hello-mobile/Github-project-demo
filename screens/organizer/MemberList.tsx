import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import {
  Clock,
  Search,
  X,
  Mail,
  Plus,
  Trash2,
  ChevronDown,
  Info,
} from "lucide-react-native";
import { eventService } from "../../services/eventService";
import { taskService } from "../../services/taskService";
import { useFocusEffect } from "@react-navigation/native";
import { useSocketNotification } from "../../context/SocketNotificationContext";

const PURPLE = "#5F33E1";
const FILTERS = ["Tất cả", "Đã xác nhận", "Chờ xác nhận"];
const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "Đã xác nhận": { color: "#6366F1", bg: "#EEF2FF" },
  "Chờ xác nhận": { color: "#F97316", bg: "#FFEDD5" },
};

const mapStatus = (apiStatus: string) => {
  if (apiStatus === "ACCEPTED") return "Đã xác nhận";
  return "Chờ xác nhận";
};

const mapRole = (apiRole: string) => {
  if (apiRole === "ORGANIZER") return "Trưởng ban";
  if (apiRole === "CO_ORGANIZER") return "Phó ban";
  return "Thành viên";
};

export default function MemberList({ navigation, route }: any) {
  const { unreadCount } = useSocketNotification();
  const { eventId, mode, preSelected } = route?.params || {};
  const isSelectMode = mode === "select";
  const [members, setMembers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedList, setInvitedList] = useState<
    { email: string; role: string }[]
  >([]);

  // Select mode: track selected member IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [eventTasks, setEventTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskAssignments, setTaskAssignments] = useState<
    Record<string, boolean>
  >({});
  const [assigningTask, setAssigningTask] = useState(false);

  const ROLES = ["Trưởng ban", "Phó ban", "Thành viên"];
  const AVATAR_COLORS = ["#7C6FF7", "#4DB6AC", "#66BB6A", "#FF8A65", "#42A5F5"];

  const fetchMembers = async () => {
    setLoadingData(true);
    setFetchError(false);
    try {
      const res = await eventService.getEventDetail(eventId);
      const data = res.data || res;
      setMembers(data.members || []);
    } catch (e) {
      console.error("MemberList fetch error:", e);
      setFetchError(true);
    } finally {
      setLoadingData(false);
    }
  };

  // Sync selectedIds every time params change (re-entry from AddTask)
  useEffect(() => {
    const ps = route?.params?.preSelected;
    if (ps && Array.isArray(ps)) {
      setSelectedIds(
        ps.map((m: any) => m._id || m.user?._id || m.id || "").filter(Boolean),
      );
    } else {
      setSelectedIds([]);
    }
  }, [route?.params?.preSelected]);

  useFocusEffect(
    useCallback(() => {
      if (!eventId) {
        setLoadingData(false);
        return;
      }
      // Cancellation flag prevents stale fetch from overwriting newer results
      let cancelled = false;
      setLoadingData(true);
      setFetchError(false);
      eventService
        .getEventDetail(eventId)
        .then((res) => {
          if (!cancelled) setMembers((res.data || res).members || []);
        })
        .catch((e) => {
          console.error("MemberList fetch error:", e);
          if (!cancelled) setFetchError(true);
        })
        .finally(() => {
          if (!cancelled) setLoadingData(false);
        });
      return () => {
        cancelled = true;
      };
    }, [eventId]),
  );

  const handleInviteConfirm = async () => {
    if (!eventId || invitedList.length === 0) {
      setShowInvite(false);
      return;
    }
    setSubmitting(true);
    try {
      for (const item of invitedList) {
        const beRole =
          item.role === "Trưởng ban"
            ? "ORGANIZER"
            : item.role === "Phó ban"
              ? "CO_ORGANIZER"
              : "STAFF";
        const res = await eventService.inviteMember({
          eventId,
          email: item.email,
          role: beRole,
        });
        if (res?.success === false) {
          throw new Error(res?.message || "Lỗi khi gửi lời mời");
        }
      }
      setInvitedList([]);
      setShowInvite(false);
      await fetchMembers();
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.message || "Không thể gửi lời mời. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    if (isSelectMode) return; // no remove in select mode
    Alert.alert(
      "Xóa thành viên",
      `Bạn có chắc muốn xóa ${memberName} khỏi sự kiện?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await eventService.removeMember(eventId, userId);
              await fetchMembers();
            } catch {
              Alert.alert("Lỗi", "Không thể xóa thành viên.");
            }
          },
        },
      ],
    );
  };

  const loadTasksForMember = async (userId: string) => {
    if (!eventId) return;
    setLoadingTasks(true);
    try {
      const res = await taskService.getEventTasks(eventId);
      const tasks = res.data || res || [];
      setEventTasks(Array.isArray(tasks) ? tasks : []);
      const map: Record<string, boolean> = {};
      (Array.isArray(tasks) ? tasks : []).forEach((t: any) => {
        const assignees = t.assignees || [];
        map[t._id] = assignees.some((a: any) => (a._id || a) === userId);
      });
      setTaskAssignments(map);
    } catch {
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleConfirmAssignments = async () => {
    setAssigningTask(true);
    try {
      for (const task of eventTasks) {
        const wasAssigned = (task.assignees || []).some(
          (a: any) => (a._id || a) === selectedMemberId,
        );
        const isNowAssigned = taskAssignments[task._id];
        if (wasAssigned !== isNowAssigned) {
          const current = (task.assignees || []).map((a: any) => a._id || a);
          const next = isNowAssigned
            ? [...current, selectedMemberId]
            : current.filter((id: string) => id !== selectedMemberId);
          await taskService.assignTask(task._id, { assignees: next });
        }
      }
      setShowTaskPicker(false);
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật phân công.");
    } finally {
      setAssigningTask(false);
    }
  };

  const addInvite = () => {
    const emails = inviteEmail
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const newEntries = emails
      .filter((e) => !invitedList.find((i) => i.email === e))
      .map((e) => ({ email: e, role: "Thành viên" }));
    if (newEntries.length) setInvitedList([...invitedList, ...newEntries]);
    setInviteEmail("");
  };

  const removeInvite = (email: string) =>
    setInvitedList(invitedList.filter((i) => i.email !== email));

  const cycleRole = (email: string) => {
    setInvitedList(
      invitedList.map((i) => {
        if (i.email !== email) return i;
        const idx = ROLES.indexOf(i.role);
        return { ...i, role: ROLES[(idx + 1) % ROLES.length] };
      }),
    );
  };

  const toggleSelectMember = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleConfirmSelection = () => {
    const selected = members.filter((m: any) => {
      const uid = m.user?._id || m.user;
      return selectedIds.includes(uid);
    });
    navigation.navigate("AddTask", { eventId, selectedAssignees: selected });
  };

  const filtered = members.filter((m: any) => {
    const displayStatus = mapStatus(m.status);
    const matchFilter =
      activeFilter === "Tất cả" || displayStatus === activeFilter;
    const name = m.user?.fullName || m.user?.email || "";
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách thành viên</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate("Notification")}
        >
          <NotificationIcon color="#1F2937" size={22} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <Search size={18} color="#9CA3AF" />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
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
              numberOfLines={1}
              style={[
                styles.filterTxt,
                f === activeFilter && styles.filterTxtActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member list */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingData ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 30 }} />
        ) : fetchError ? (
          <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
            <Text style={{ color: "#6B7280", fontSize: 14 }}>
              Không thể tải danh sách thành viên.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: PURPLE,
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 20,
              }}
              onPress={fetchMembers}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Thử lại
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((member: any, idx: number) => {
            const displayStatus = mapStatus(member.status);
            const s = STATUS_STYLES[displayStatus] ?? {
              color: "#6B7280",
              bg: "#F3F4F6",
            };
            const userId = member.user?._id || member.user;
            const name =
              member.user?.fullName || member.user?.email || "Thành viên";
            const role = mapRole(member.role);
            return (
              <View key={userId || idx} style={styles.card}>
                <View style={styles.cardTopRow}>
                  {isSelectMode && member.status === "ACCEPTED" && (
                    <TouchableOpacity
                      onPress={() => toggleSelectMember(userId)}
                      style={{ marginRight: 10 }}
                    >
                      <View
                        style={[
                          styles.selectCircle,
                          selectedIds.includes(userId) &&
                            styles.selectCircleActive,
                        ]}
                      >
                        {selectedIds.includes(userId) && (
                          <Text style={styles.selectCheckMark}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  <View style={styles.cardLeft}>
                    <Text style={styles.memberName}>{name}</Text>
                    <View style={styles.timeRow}>
                      <Clock size={13} color="#9CA3AF" />
                      <Text style={styles.timeTxt}>{role}</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeTxt, { color: s.color }]}>
                        {displayStatus}
                      </Text>
                    </View>
                    {!isSelectMode && (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(userId, name)}
                      >
                        <Trash2 size={16} color="#D1D5DB" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {!isSelectMode && member.status === "ACCEPTED" && (
                  <TouchableOpacity
                    style={styles.assignTaskBtn}
                    onPress={() => {
                      setSelectedMemberId(userId);
                      setSelectedMemberName(name);
                      loadTasksForMember(userId);
                      setShowTaskPicker(true);
                    }}
                  >
                    <Text style={styles.assignTaskBtnTxt}>+ Gán task</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomWrap}>
        {isSelectMode ? (
          <TouchableOpacity
            style={[
              styles.addBtn,
              selectedIds.length === 0 && { backgroundColor: "#C4B5FD" },
            ]}
            activeOpacity={0.85}
            onPress={handleConfirmSelection}
            disabled={selectedIds.length === 0}
          >
            <Text style={styles.addBtnTxt}>
              {selectedIds.length > 0
                ? `Xác nhận (${selectedIds.length} thành viên)`
                : "Chưa chọn thành viên"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => setShowInvite(true)}
          >
            <Text style={styles.addBtnTxt}>Thêm thành viên</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task Assign Modal */}
      <Modal visible={showTaskPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.inviteTitle}>Gán task</Text>
              <TouchableOpacity onPress={() => setShowTaskPicker(false)}>
                <X size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inviteSubtitle}>
              Chọn task để phân công cho{" "}
              <Text style={{ fontWeight: "700", color: "#3D3A5C" }}>
                {selectedMemberName}
              </Text>
            </Text>
            {loadingTasks ? (
              <ActivityIndicator
                color={PURPLE}
                style={{ marginVertical: 24 }}
              />
            ) : eventTasks.length === 0 ? (
              <Text
                style={{
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginVertical: 24,
                }}
              >
                Sự kiện chưa có task nào.
              </Text>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 360 }}
                keyboardShouldPersistTaps="handled"
              >
                {eventTasks.map((task: any) => {
                  const checked = !!taskAssignments[task._id];
                  return (
                    <TouchableOpacity
                      key={task._id}
                      style={styles.taskPickerRow}
                      onPress={() =>
                        setTaskAssignments((prev) => ({
                          ...prev,
                          [task._id]: !prev[task._id],
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.taskCheckCircle,
                          checked && styles.taskCheckCircleActive,
                        ]}
                      >
                        {checked && <Text style={styles.taskCheckMark}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskPickerTitle}>{task.title}</Text>
                        {task.group ? (
                          <Text style={styles.taskPickerGroup}>
                            {task.group}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, assigningTask && { opacity: 0.6 }]}
              onPress={handleConfirmAssignments}
              disabled={assigningTask}
            >
              <Text style={styles.confirmBtnText}>
                {assigningTask ? "Đang lưu..." : "XÁC NHẬN"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal visible={showInvite} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.inviteTitle}>Mời thành viên</Text>
              <TouchableOpacity onPress={() => setShowInvite(false)}>
                <X size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inviteSubtitle}>
              Nhập email để mời người tham gia sự kiện.
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Email input */}
              <View style={styles.emailInputRow}>
                <Mail size={18} color="#B0AEC8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Nhập email để thêm"
                  placeholderTextColor="#B0AEC8"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  onSubmitEditing={addInvite}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addEmailBtn}
                  onPress={addInvite}
                >
                  <Plus size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Hint */}
              <View style={styles.hintRow}>
                <Info size={13} color="#9CA3AF" />
                <Text style={styles.hintText}>
                  Bạn có thể nhập nhiều email, phân cách bằng dấu phẩy hoặc nhấn
                  Enter.
                </Text>
              </View>

              {/* Chips */}
              {invitedList.length > 0 && (
                <View style={styles.chipRow}>
                  {invitedList.map((item) => (
                    <View key={item.email} style={styles.chip}>
                      <Text style={styles.chipText}>{item.email}</Text>
                      <TouchableOpacity
                        onPress={() => removeInvite(item.email)}
                      >
                        <Text style={styles.chipX}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* List */}
              {invitedList.length > 0 && (
                <>
                  <Text style={styles.listHeader}>
                    Danh sách mời ({invitedList.length})
                  </Text>
                  {invitedList.map((item, idx) => (
                    <View key={item.email} style={styles.memberRow}>
                      <View
                        style={[
                          styles.inviteAvatar,
                          {
                            backgroundColor:
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          },
                        ]}
                      >
                        <Text style={styles.inviteAvatarText}>
                          {item.email[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.memberEmail} numberOfLines={1}>
                        {item.email}
                      </Text>
                      <TouchableOpacity
                        style={styles.roleBtn}
                        onPress={() => cycleRole(item.email)}
                      >
                        <Text style={styles.roleBtnText}>{item.role}</Text>
                        <ChevronDown size={13} color={PURPLE} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeInvite(item.email)}
                        style={{ marginLeft: 8 }}
                      >
                        <Trash2 size={18} color="#D1D5DB" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Footer note */}
              <View style={styles.footerNote}>
                <Info size={14} color="#9CA3AF" />
                <Text style={styles.footerNoteText}>
                  Email mời sẽ được gửi khi bạn xác nhận.
                </Text>
              </View>
              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, submitting && { opacity: 0.6 }]}
              onPress={handleInviteConfirm}
              disabled={submitting}
            >
              <Text style={styles.confirmBtnText}>
                {submitting ? "Đang gửi..." : "XÁC NHẬN"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerBtn: { width: 36, alignItems: "center" },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#EDE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: { backgroundColor: "#5F33E1" },
  filterTxt: { fontSize: 12, color: "#5F33E1", fontWeight: "600" },
  filterTxtActive: { color: "#FFF", fontWeight: "600" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flex: 1 },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeTxt: { fontSize: 12, color: "#9CA3AF" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 11, fontWeight: "700" },
  bottomWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "transparent",
  },
  addBtn: {
    backgroundColor: "#5F33E1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  addBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D3A5C",
  },
  inviteSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 18,
  },
  emailInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: PURPLE,
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  emailInput: {
    flex: 1,
    fontSize: 14,
    color: "#3D3A5C",
    paddingVertical: 0,
  },
  addEmailBtn: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: "#9CA3AF",
    flex: 1,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  chipText: { fontSize: 12, color: "#3D3A5C" },
  chipX: { fontSize: 16, color: "#9CA3AF", lineHeight: 18 },
  listHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D3A5C",
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inviteAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  inviteAvatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  memberEmail: { flex: 1, fontSize: 13, color: "#3D3A5C" },
  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
  },
  roleBtnText: { fontSize: 12, color: PURPLE, fontWeight: "500" },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  footerNoteText: { flex: 1, fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  confirmBtn: {
    backgroundColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  assignTaskBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#EEE9FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  assignTaskBtnTxt: {
    color: "#5F33E1",
    fontSize: 12,
    fontWeight: "600",
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectCircleActive: {
    backgroundColor: "#5F33E1",
    borderColor: "#5F33E1",
  },
  selectCheckMark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  taskPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  taskCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckCircleActive: {
    backgroundColor: "#5F33E1",
    borderColor: "#5F33E1",
  },
  taskCheckMark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  taskPickerTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  taskPickerGroup: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
});
