import React, { useState } from "react";
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
import {
  NotificationIcon,
  BriefcaseIcon,
  MapIcon,
  CalendarIcon,
} from "../../components/Icons";
import InvitePopup from "../../components/InvitePopup";

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
      <Text
        style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}
      >{`${percent}%`}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [showInvite, setShowInvite] = useState(true);

  return (
    <>
      <ImageBackground
        source={require("../../assets/bgSplash.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollArea}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Account")}
                >
                  <View style={styles.avatar} />
                </TouchableOpacity>
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

            {/* Banner */}
            <View style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  Nhiệm vụ hôm nay của bạn sắp hoàn thành!
                </Text>
                <TouchableOpacity
                  style={styles.bannerBtn}
                  onPress={() => navigation.navigate("Calendar")}
                >
                  <Text style={styles.bannerBtnText}>Xem nhiệm vụ</Text>
                </TouchableOpacity>
              </View>
              <CircularProgress percent={85} />
            </View>

            {/* Đang tham gia */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đang tham gia</Text>
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
            >
              <TouchableOpacity
                style={styles.cardH}
                onPress={() =>
                  navigation.navigate("TaskDetailStaff", {
                    task: {
                      title: "Hỗ trợ gian hàng số 14",
                      group: "Nhóm khu A",
                      status: "Đang làm",
                      time: "10:00 AM",
                    },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.tag}>Job fair</Text>
                <Text style={styles.cardHTitle}>Hỗ trợ gian hàng số 14</Text>
                <View style={styles.cardHBottom}>
                  <CalendarIcon color="#9CA3AF" size={14} />
                  <Text style={styles.cardHTime}>10:00 AM • 01 May</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cardH, { backgroundColor: "#FFEDD5" }]}
                onPress={() =>
                  navigation.navigate("TaskDetailStaff", {
                    task: {
                      title: "Sound check",
                      group: "Nhóm kỹ thuật",
                      status: "Đang làm",
                      time: "12:00 PM",
                    },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.tag}>Câu lạc bộ âm nhạc</Text>
                <Text style={styles.cardHTitle}>Sound check</Text>
                <View style={styles.cardHBottom}>
                  <CalendarIcon color="#9CA3AF" size={14} />
                  <Text style={styles.cardHTime}>12:00 PM • 01 May</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Sự kiện */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện của tôi</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>4</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.eventItem}
              onPress={() => navigation.navigate("EventDetail")}
            >
              <View style={[styles.iconBox, { backgroundColor: "#FCE7F3" }]}>
                <BriefcaseIcon color="#DB2777" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.eventTitle}>Job fair</Text>
                <Text style={styles.eventSub}>23 Tasks</Text>
              </View>
              <Text style={styles.eventPercent}>46%</Text>
            </TouchableOpacity>

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
                  source={require("../../assets/book.png")}
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

      <InvitePopup
        visible={showInvite}
        inviterName="Nguyễn Minh Anh"
        inviterInitial="M"
        eventName="Hội thảo Công nghệ 2025"
        role="Thành viên"
        onAccept={() => setShowInvite(false)}
        onDecline={() => setShowInvite(false)}
      />
    </>
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
    marginBottom: 16,
    flex: 1,
  },
  cardHBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardHTime: { fontSize: 13, color: "#9CA3AF" },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
