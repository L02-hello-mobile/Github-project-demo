import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { MapIcon } from "../../components/Icons";
import {
  ChevronLeft,
  Mail,
  Plus,
  Trash2,
  ChevronDown,
  Info,
} from "lucide-react-native";
import { eventService } from "../../services/eventService";
import { uploadService } from "../../services/uploadService";

const PURPLE = "#6C63FF";

function StepIndicator({ step, current }: { step: number; current: number }) {
  const active = step === current;
  const done = step < current;
  return (
    <View
      style={[
        styles.stepCircle,
        active || done
          ? { backgroundColor: PURPLE, borderColor: PURPLE }
          : { backgroundColor: "transparent", borderColor: "#C0B8F8" },
      ]}
    >
      <Text
        style={[
          styles.stepText,
          active || done ? { color: "#fff" } : { color: "#C0B8F8" },
        ]}
      >
        {step}
      </Text>
    </View>
  );
}

function StepRow({ current }: { current: number }) {
  return (
    <View style={styles.stepRow}>
      <StepIndicator step={1} current={current} />
      <View style={styles.stepLine} />
      <StepIndicator step={2} current={current} />
      <View style={styles.stepLine} />
      <StepIndicator step={3} current={current} />
    </View>
  );
}

type Props = {
  navigation?: any;
};

export default function CreateEvent({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date(2026, 3, 5));
  const [endDate, setEndDate] = useState(new Date(2026, 3, 11));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedList, setInvitedList] = useState<
    { email: string; role: string }[]
  >([]);

  const ROLES = ["Trưởng ban", "Phó ban", "Thành viên"];
  const AVATAR_COLORS = ["#7C6FF7", "#4DB6AC", "#66BB6A", "#FF8A65", "#42A5F5"];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapRoleToBE = (role: string) => {
    if (role === "Trưởng ban") return "ORGANIZER";
    if (role === "Phó ban") return "CO_ORGANIZER";
    return "STAFF";
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

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const onStartChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selected) setStartDate(selected);
  };

  const onEndChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selected) setEndDate(selected);
  };

  const pickMapImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMapImage(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation?.goBack();
  };

  const handleNext = async () => {
    setError("");
    if (step === 1) {
      if (!eventName.trim()) {
        setError("Vui lòng nhập tên sự kiện");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Step 3 "HOÀN THÀNH" — gọi BE tạo event + upload map + invite
      setLoading(true);
      try {
        const res = await eventService.createEvent({
          name: eventName,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        const newEventId = res.data?._id || res._id;
        if (!newEventId) {
          setError(res.message || "Không thể tạo sự kiện");
          return;
        }

        if (mapImage) {
          try {
            const formData = new FormData();
            formData.append("image", {
              uri: mapImage,
              name: "map.jpg",
              type: "image/jpeg",
            } as any);
            const uploadRes = await uploadService.uploadImage(formData);
            const imageUrl = uploadRes.data?.imageUrl || uploadRes.imageUrl;
            if (imageUrl) {
              await eventService.uploadMap(newEventId, {
                mapImageUrl: imageUrl,
              });
            }
          } catch {}
        }

        for (const item of invitedList) {
          try {
            await eventService.inviteMember({
              eventId: newEventId,
              email: item.email,
              role: mapRoleToBE(item.role),
            });
          } catch {}
        }

        navigation?.navigate("EventsTasks_Org", { eventId: newEventId });
      } catch {
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={26} color="#3D3A5C" />
        </TouchableOpacity>
        <Text style={styles.title}>SỰ KIỆN MỚI</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <StepRow current={step} />

      {/* Step 1: Basic info */}
      {step === 1 && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Tên sự kiện"
            placeholderTextColor="#B0AEC8"
            value={eventName}
            onChangeText={setEventName}
          />

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Ngày bắt đầu</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartChange}
            />
          )}

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Ngày kết thúc</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndChange}
            />
          )}

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả"
            placeholderTextColor="#B0AEC8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Step 2: Map image */}
      {step === 2 && (
        <View style={styles.form}>
          <View style={styles.mapCard}>
            <Text style={styles.mapCardTitle}>Bản đồ</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={pickMapImage}
              activeOpacity={0.7}
            >
              {mapImage ? (
                <Image
                  source={{ uri: mapImage }}
                  style={styles.mapPreview}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <MapIcon color={PURPLE} size={48} />
                  <Text style={styles.uploadText}>Tải ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Invite members */}
      {step === 3 && (
        <ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.inviteTitle}>Mời thành viên</Text>
          <Text style={styles.inviteSubtitle}>
            Nhập email để mời người tham gia sự kiện.
          </Text>

          {/* Email input */}
          <View style={styles.emailInputRow}>
            <Mail size={14} color="#B0AEC8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.emailInput}
              placeholder="Nhập email và nhấn Enter để thêm"
              placeholderTextColor="#B0AEC8"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              onSubmitEditing={addInvite}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addInvite}>
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

          {/* Email chips */}
          {invitedList.length > 0 && (
            <View style={styles.chipRow}>
              {invitedList.map((item) => (
                <View key={item.email} style={styles.chip}>
                  <Text style={styles.chipText}>{item.email}</Text>
                  <TouchableOpacity onPress={() => removeInvite(item.email)}>
                    <Text style={styles.chipX}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* List */}
          <Text style={styles.listHeader}>
            Danh sách mời ({invitedList.length})
          </Text>
          {invitedList.map((item, idx) => (
            <View key={item.email} style={styles.memberRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                  },
                ]}
              >
                <Text style={styles.avatarText}>
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

          {/* Footer note */}
          <View style={styles.footerNote}>
            <Info size={14} color="#9CA3AF" />
            <Text style={styles.footerNoteText}>
              Email mời sẽ được gửi khi bạn hoàn thành tạo sự kiện.
            </Text>
          </View>
          <View style={{ height: 16 }} />
        </ScrollView>
      )}

      {/* Bottom buttons */}
      {error ? (
        <Text
          style={{
            color: "#EF4444",
            textAlign: "center",
            marginHorizontal: 24,
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          {error}
        </Text>
      ) : null}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.outlineButtonText}>QUAY LẠI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filledButton, loading && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.filledButtonText}>
            {loading ? "Đang xử lý..." : step === 3 ? "HOÀN THÀNH" : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D3A5C",
    letterSpacing: 1,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#DDD8F8",
    marginHorizontal: 4,
    maxWidth: 60,
  },
  form: {
    flex: 1,
    gap: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#3D3A5C",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  dateRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 15,
    color: "#3D3A5C",
  },
  dateValue: {
    fontSize: 15,
    color: PURPLE,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    color: PURPLE,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  filledButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  filledButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3A5C",
    marginBottom: 14,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#C0B8F8",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: PURPLE,
    fontWeight: "500",
  },
  mapPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  inviteTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3D3A5C",
    marginBottom: 6,
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
  addBtn: {
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
  chipText: {
    fontSize: 12,
    color: "#3D3A5C",
  },
  chipX: {
    fontSize: 16,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  listHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D3A5C",
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  memberEmail: {
    flex: 1,
    fontSize: 13,
    color: "#3D3A5C",
  },
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
  roleBtnText: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: "500",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
});
