import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowIcon,
  CalendarIcon,
  NotificationIcon,
  MapIcon,
} from "../../components/Icons";
import { Users, ImageIcon } from "lucide-react-native";

export default function TaskDetail_Staff() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const task = route.params?.task ?? {};

  const title = task.title ?? "Kê bàn";
  const group = task.group ?? "Nhóm khu C";
  const description =
    task.description ??
    "Sinh viên tình nguyện thực hiện việc kê bàn theo đúng khu vực quy định, số lượng 100 bàn.";
  const startDate = task.startDate ?? "01 May, 2026";
  const endDate = task.endDate ?? "01 May, 2026";

  const [started, setStarted] = useState(false);
  const [evidenceUris, setEvidenceUris] = useState<string[]>([]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setEvidenceUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <NotificationIcon color="#1F2937" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        {/* Group card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Users size={18} color="#5F33E1" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.label}>Nhóm</Text>
              <Text style={styles.valueText}>{group}</Text>
            </View>
          </View>
        </View>

        {/* Task name card */}
        <View style={styles.card}>
          <Text style={styles.label}>Nhiệm vụ</Text>
          <Text style={styles.valueText}>{title}</Text>
        </View>

        {/* Description card */}
        <View style={styles.card}>
          <Text style={styles.label}>Mô tả</Text>
          <Text style={styles.descText}>{description}</Text>
        </View>

        {/* Date range card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <CalendarIcon color="#5F33E1" size={28} />
            <View style={styles.cardBody}>
              <Text style={styles.label}>Ngày bắt đầu - Ngày kết thúc</Text>
              <Text style={styles.valueText}>
                {startDate} - {endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Map card */}
        <View style={[styles.card, styles.actionCard]}>
          <MapIcon color="#5F33E1" size={40} />
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.75}
            onPress={() => navigation.navigate("MapViewStaff")}
          >
            <Text style={styles.actionButtonText}>Xem bản đồ</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence card */}
        <View style={styles.card}>
          <View style={styles.actionCard}>
            <View style={styles.iconBox}>
              <ImageIcon size={18} color="#5F33E1" />
            </View>
            <Text style={styles.evidenceLabel}>Minh chứng hoàn thành</Text>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.75}
              onPress={handlePickImage}
            >
              <Text style={styles.actionButtonText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </View>
          {evidenceUris.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.evidenceScroll}
              contentContainerStyle={{ gap: 10 }}
            >
              {evidenceUris.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={styles.evidenceThumb}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Bottom action button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => setStarted((v) => !v)}
        >
          <Text style={styles.startButtonText}>
            {started ? "Hoàn thành nhiệm vụ" : "Bắt đầu nhiệm vụ"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 62,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },

  scrollArea: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "LexendDeca_400Regular",
    marginBottom: 3,
  },
  valueText: {
    fontSize: 15,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },
  descText: {
    fontSize: 13,
    fontFamily: "LexendDeca_400Regular",
    color: "#374151",
    lineHeight: 21,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "LexendDeca_700Bold",
    color: "#5F33E1",
  },
  evidenceLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "LexendDeca_400Regular",
    color: "#1F2937",
    marginLeft: 12,
  },
  evidenceScroll: {
    marginTop: 14,
  },
  evidenceThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },

  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
  },
  startButton: {
    backgroundColor: "#5F33E1",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#FFFFFF",
  },
});
