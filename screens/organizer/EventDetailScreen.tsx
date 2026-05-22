import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import Svg, { Circle } from "react-native-svg";

function BigCircularProgress({ percent }: { percent: number }) {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const filled = (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size / 2 + 20, alignItems: "center", marginTop: 20 }}>
      <Svg width={size} height={size / 2} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-180 ${size / 2} ${size / 2})`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#5F33E1"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-180 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: "absolute", bottom: 0, alignItems: "center" }}>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Total</Text>
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1F2937" }}>{`%${percent}`}</Text>
      </View>
    </View>
  );
}

export default function EventDetailScreen({ navigation }: any) {
  return (
    <ImageBackground source={require("../../assets/bgSplash.png")} style={styles.bg} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>{"<-"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job fair</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Tiến độ công việc</Text>
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <BigCircularProgress percent={46} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nhiệm vụ nhóm A</Text>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeTxt}>6/10 tasks</Text>
            </View>
          </View>
          <Text style={styles.percentTxt}>60%</Text>
          <View style={styles.multiBar}>
            <View style={[styles.barSegment, { flex: 6, backgroundColor: "#0EA5E9" }]} />
            <View style={[styles.barSegment, { flex: 2, backgroundColor: "#22C55E" }]} />
            <View style={[styles.barSegment, { flex: 2, backgroundColor: "#EAB308" }]} />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#0EA5E9" }]} />
              <Text style={styles.legendTxt}>Done</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.legendTxt}>In process</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#EAB308" }]} />
              <Text style={styles.legendTxt}>To do</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nhiệm vụ nhóm B</Text>
            <View style={[styles.taskBadge, { width: 10, height: 10, padding: 0 }]} />
          </View>
          <Text style={styles.percentTxt}>60%</Text>
          <View style={styles.multiBar}>
            <View style={[styles.barSegment, { flex: 6, backgroundColor: "#0EA5E9" }]} />
            <View style={[styles.barSegment, { flex: 2, backgroundColor: "#22C55E" }]} />
            <View style={[styles.barSegment, { flex: 2, backgroundColor: "#EAB308" }]} />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#0EA5E9" }]} />
              <Text style={styles.legendTxt}>Done</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.legendTxt}>In process</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#EAB308" }]} />
              <Text style={styles.legendTxt}>To do</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backTxt: { fontSize: 20, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  card: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontWeight: "bold", fontSize: 15, color: "#1F2937" },
  taskBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  taskBadgeTxt: { fontSize: 10, color: "#10B981", fontWeight: "bold" },
  percentTxt: { fontSize: 28, fontWeight: "bold", color: "#1F2937", marginBottom: 10 },
  multiBar: { height: 8, borderRadius: 4, flexDirection: "row", overflow: "hidden", gap: 2, marginBottom: 15 },
  barSegment: { height: "100%", borderRadius: 4 },
  legend: { flexDirection: "row", gap: 15 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendTxt: { fontSize: 12, color: "#6B7280" }
});