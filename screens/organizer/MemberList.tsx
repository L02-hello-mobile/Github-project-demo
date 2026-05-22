import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from "react-native";
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import { Clock, Search } from "lucide-react-native";

const FILTERS = ["Tất cả", "Cần làm", "Đang làm", "Hoàn thành"];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "Hoàn thành": { color: "#6366F1", bg: "#EEF2FF" },
  "Đang làm": { color: "#F97316", bg: "#FFEDD5" },
  "Cần làm": { color: "#8B5CF6", bg: "#F5F3FF" },
};

const MEMBERS = [
  { id: "1", name: "Nguyễn Văn A", time: "10:00 AM", status: "Hoàn thành" },
  { id: "2", name: "Nguyễn Văn B", time: "10:00 AM", status: "Hoàn thành" },
  { id: "3", name: "Nguyễn Văn C", time: "10:00 AM", status: "Đang làm" },
  { id: "4", name: "Nguyễn Văn D", time: "10:00 AM", status: "Hoàn thành" },
];

export default function MemberList({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MEMBERS.filter((m) => {
    const matchFilter = activeFilter === "Tất cả" || m.status === activeFilter;
    const matchSearch = m.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
        <View style={styles.headerBtn}>
          <NotificationIcon color="#1F2937" size={22} />
        </View>
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
        {filtered.map((member) => {
          const s = STATUS_STYLES[member.status] ?? {
            color: "#6B7280",
            bg: "#F3F4F6",
          };
          return (
            <View key={member.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.timeRow}>
                  <Clock size={13} color="#9CA3AF" />
                  <Text style={styles.timeTxt}>{member.time}</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <Text style={[styles.badgeTxt, { color: s.color }]}>
                  {member.status}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
          <Text style={styles.addBtnTxt}>Thêm thành viên</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
});
