import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { NotificationIcon, BriefcaseIcon, MapIcon } from "../components/Icons";

function CircularProgress({ percent }: { percent: number }) {
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
        {percent}%
      </Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollArea}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.helloText}>Hello!</Text>
                <Text style={styles.nameText}>Hello Mobile</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notification")}
              activeOpacity={0.7}
            >
              <NotificationIcon color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Banner Tím */}
          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                Nhiệm vụ của bạn sắp hoàn thành!
              </Text>
              <TouchableOpacity
                testID="btn-action"
                style={styles.bannerBtn}
                onPress={() => navigation.navigate("Calendar")}
              >
                <Text style={styles.bannerBtnText}>Xem nhiệm vụ</Text>
              </TouchableOpacity>
            </View>
            <CircularProgress percent={85} />
          </View>

          {/* Đang diễn ra */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đang diễn ra</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>6</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hList}
            contentContainerStyle={{ paddingRight: 25 }}
            nestedScrollEnabled
            fadingEdgeLength={3}
          >
            <View style={styles.cardH}>
              <Text style={styles.tag}>Job fair</Text>
              <Text style={styles.cardHTitle}>Hỗ trợ gian hàng số 14</Text>
              <View style={styles.pBar}>
                <View style={[styles.pFill, { width: "60%" }]} />
              </View>
            </View>
            <View style={[styles.cardH, { backgroundColor: "#FFEDD5" }]}>
              <Text style={styles.tag}>Câu lạc bộ âm nhạc</Text>
              <Text style={styles.cardHTitle}>Sound check</Text>
              <View style={styles.pBar}>
                <View
                  style={[
                    styles.pFill,
                    { width: "30%", backgroundColor: "#F97316" },
                  ]}
                />
              </View>
            </View>
          </ScrollView>

          {/* Sự kiện */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>4</Text>
            </View>
          </View>
          <View style={styles.eventItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FCE7F3" }]}>
              <BriefcaseIcon color="#DB2777" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.eventTitle}>Job fair</Text>
              <Text style={styles.eventSub}>23 Tasks</Text>
            </View>
            <Text style={styles.eventPercent}>70%</Text>
          </View>
          <View style={styles.eventItem}>
            <View style={[styles.iconBox, { backgroundColor: "#E0E7FF" }]}>
              <MapIcon color="#4F46E5" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.eventTitle}>Câu lạc bộ âm nhạc</Text>
              <Text style={styles.eventSub}>30 Tasks</Text>
            </View>
            <Text style={styles.eventPercent}>52%</Text>
          </View>
          <View style={styles.eventItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FFEDD5" }]}>
              <Image
                source={require("../assets/book.png")}
                style={styles.iconImg}
                tintColor="#F97316"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.eventTitle}>Team building</Text>
              <Text style={styles.eventSub}>30 Tasks</Text>
            </View>
            <Text style={styles.eventPercent}>87%</Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, paddingTop: 40 },
  scrollArea: { padding: 25, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0EA5E9",
    marginRight: 15,
  },
  helloText: { color: "#6B7280", fontSize: 14 },
  nameText: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  banner: {
    backgroundColor: "#5F33E1",
    borderRadius: 30,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 15,
    lineHeight: 22,
  },
  bannerBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: "#5F33E1", fontWeight: "bold" },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#818CF8",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderLeftWidth: 5,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  progressVal: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    transform: [{ rotate: "-45deg" }],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  badge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeText: { color: "#8B5CF6", fontWeight: "bold", fontSize: 12 },
  hList: { marginBottom: 35 },
  cardH: {
    width: 240,
    backgroundColor: "#EEF2FF",
    borderRadius: 25,
    padding: 20,
    marginRight: 15,
  },
  tag: { color: "#6B7280", fontSize: 12, marginBottom: 8 },
  cardHTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 25,
  },
  pBar: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3 },
  pFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 3 },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)",
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImg: { width: 20, height: 20 },
  eventTitle: { fontWeight: "bold", fontSize: 16, color: "#1F2937" },
  eventSub: { color: "#9CA3AF", fontSize: 13 },
  eventPercent: {
    fontWeight: "bold",
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    borderRadius: 12,
  },
});
