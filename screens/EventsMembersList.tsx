import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Clock } from "lucide-react-native";
import ArrowIcon from "../components/Icon/LeftArrow";
import BellIcon from "../components/Icon/Notification";

const { width } = Dimensions.get("window");

const FILTERS = ["Tất cả", "Hoàn thành", "Đang làm", "Cần làm"];

const MEMBERS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    time: "10:00 AM",
    status: "Hoàn thành",
    statusColor: "#7C3AED",
    statusBg: "#EEF2FF",
  },
  {
    id: "2",
    name: "Nguyễn Văn B",
    time: "10:00 AM",
    status: "Hoàn thành",
    statusColor: "#7C3AED",
    statusBg: "#EEF2FF",
  },
  {
    id: "3",
    name: "Nguyễn Văn C",
    time: "10:00 AM",
    status: "Đang làm",
    statusColor: "#F97316",
    statusBg: "#FEF3C7",
  },
  {
    id: "4",
    name: "Nguyễn Văn D",
    time: "10:00 AM",
    status: "Hoàn thành",
    statusColor: "#7C3AED",
    statusBg: "#EEF2FF",
  },
];

export default function MembersScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const filteredMembers = MEMBERS.filter((member) => {
    const lower = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !lower || member.name.toLowerCase().includes(lower);
    const matchesFilter =
      activeFilter === "Tất cả" || member.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowIcon size={24} color="#24252C" />
        </TouchableOpacity>

        <Text style={styles.title}>Danh sách thành viên</Text>

        <TouchableOpacity onPress={() => alert("Đi tới màn hình thông báo!")}> 
          <BellIcon size={24} color="#24252C" hasNotification={true} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
          <Search size={18} color="#8E8E93" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listContainer}>
          {filteredMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.memberMeta}>
                  <Clock size={16} color="#7C3AED" />
                  <Text style={styles.memberTime}>{member.time}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: member.statusBg }]}> 
                <Text style={[styles.statusText, { color: member.statusColor }]}> 
                  {member.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Thêm thành viên</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FE",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16181D",
  },
  searchWrapper: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    color: "#111827",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#5F33E1",
  },
  filterText: {
    color: "#5F33E1",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    marginTop: 20,
  },
  memberCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberTime: {
    color: "#6B7280",
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bottomAction: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
  },
  addButton: {
    backgroundColor: "#5F33E1",
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
