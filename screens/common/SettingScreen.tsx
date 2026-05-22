import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from "react-native";
import { ArrowIcon } from "../../components/Icons";
import {
  Lock,
  LogOut,
  Bell,
  AlarmClock,
  CheckCircle2,
  Globe,
  Info,
  FileText,
  ChevronRight,
} from "lucide-react-native";

type SettingRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  hasArrow?: boolean;
  labelColor?: string;
  onPress?: () => void;
};

function SettingRow({
  icon,
  iconBg,
  label,
  value,
  hasArrow,
  labelColor = "#1F2937",
  onPress,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {hasArrow && <ChevronRight size={18} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );
}

function CustomToggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handlePress = () => {
    const next = !value;
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onToggle(next);
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 27],
  });
  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#5F33E1"],
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <Animated.View style={[styles.track, { backgroundColor: bgColor }]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

type ToggleRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
};

function ToggleRow({ icon, iconBg, label, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <CustomToggle value={value} onToggle={onToggle} />
    </View>
  );
}

export default function SettingScreen({ navigation }: any) {
  const [notifAll, setNotifAll] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifTask, setNotifTask] = useState(true);

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
        <Text style={styles.headerTitle}>CÀI ĐẶT</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── TÀI KHOẢN & BẢO MẬT ── */}
        <Text style={styles.sectionLabel}>TÀI KHOẢN &amp; BẢO MẬT</Text>
        <View style={styles.card}>
          {/* User info */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>M</Text>
            </View>
            <View>
              <Text style={styles.userName}>Hello Mobile</Text>
              <Text style={styles.userEmail}>helloMobile@gmail.com</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <SettingRow
            icon={<Lock size={18} color="#FFF" />}
            iconBg="#6366F1"
            label="Đổi mật khẩu"
            hasArrow
            onPress={() => navigation.navigate("Account")}
          />

          <View style={styles.divider} />

          <SettingRow
            icon={<LogOut size={18} color="#FFF" />}
            iconBg="#EF4444"
            label="Đăng xuất"
            labelColor="#EF4444"
            onPress={() => navigation.navigate("Login")}
          />
        </View>

        {/* ── THÔNG BÁO ── */}
        <Text style={styles.sectionLabel}>THÔNG BÁO</Text>
        <View style={styles.card}>
          <ToggleRow
            icon={<Bell size={18} color="#FFF" />}
            iconBg="#6366F1"
            label="Tất cả thông báo"
            value={notifAll}
            onToggle={setNotifAll}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<AlarmClock size={18} color="#FFF" />}
            iconBg="#F97316"
            label="Nhắc việc (5 phút trước)"
            value={notifReminder}
            onToggle={setNotifReminder}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<CheckCircle2 size={18} color="#FFF" />}
            iconBg="#22C55E"
            label="Task được giao"
            value={notifTask}
            onToggle={setNotifTask}
          />
        </View>

        {/* ── ỨNG DỤNG ── */}
        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Globe size={18} color="#FFF" />}
            iconBg="#3B82F6"
            label="Ngôn ngữ"
            value="Tiếng Việt"
            hasArrow
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<Info size={18} color="#FFF" />}
            iconBg="#9CA3AF"
            label="Phiên bản"
            value="1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<FileText size={18} color="#FFF" />}
            iconBg="#6B7280"
            label="Chính sách & Điều khoản"
            hasArrow
          />
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 1,
  },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTxt: { fontSize: 18, fontWeight: "700", color: "#6366F1" },
  userName: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  userEmail: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, color: "#1F2937", fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 13, color: "#9CA3AF" },
  track: {
    width: 56,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
