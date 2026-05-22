import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Calendar } from "lucide-react-native";

type Props = {
  visible: boolean;
  inviterName: string;
  inviterInitial: string;
  eventName: string;
  role?: string;
  onAccept: () => void;
  onDecline: () => void;
};

export default function InvitePopup({
  visible,
  inviterName,
  inviterInitial,
  eventName,
  role = "Thành viên",
  onAccept,
  onDecline,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onDecline}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{inviterInitial}</Text>
          </View>

          {/* Label */}
          <View style={styles.labelWrap}>
            <Text style={styles.label}>LỜI MỜI THAM GIA</Text>
          </View>

          {/* Inviter name */}
          <Text style={styles.name}>{inviterName}</Text>
          <Text style={styles.subText}>đã mời bạn tham gia sự kiện</Text>

          {/* Event pill */}
          <View style={styles.eventPill}>
            <Calendar size={15} color="#6366F1" />
            <Text style={styles.eventTxt}>{eventName}</Text>
          </View>

          {/* Role */}
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>với vai trò: </Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleTxt}>{role}</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnDecline}
              onPress={onDecline}
              activeOpacity={0.8}
            >
              <Text style={styles.btnDeclineTxt}>TỪ CHỐI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnAccept}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAcceptTxt}>CHẤP NHẬN</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EDE8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarTxt: { fontSize: 26, fontWeight: "700", color: "#6366F1" },
  labelWrap: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
  },
  name: { fontSize: 20, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  subText: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  eventPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  eventTxt: { fontSize: 14, fontWeight: "600", color: "#4F46E5" },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  roleLabel: { fontSize: 14, color: "#6B7280" },
  rolePill: {
    backgroundColor: "#5F33E1",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  roleTxt: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  btnDecline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDeclineTxt: { fontWeight: "700", color: "#6B7280", fontSize: 13 },
  btnAccept: {
    flex: 1,
    backgroundColor: "#5F33E1",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnAcceptTxt: { fontWeight: "700", color: "#FFF", fontSize: 13 },
});
