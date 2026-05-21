import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Home, Calendar, FileText, Map, Plus } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function BottomNavigation() {
  const center = width / 2;
  const borderRadius = 20; // Độ bo tròn của 2 góc bên rìa màn hình (bạn có thể tăng giảm tùy ý)

  // Đường Path động: Bo tròn góc trái -> Chạy thẳng -> Lõm ở giữa -> Chạy thẳng -> Bo tròn góc phải
  const d = `
    M 0 ${borderRadius}
    Q 0 0 ${borderRadius} 0
    H ${center - 55} 
    C ${center - 40} 0, ${center - 45} 35, ${center} 35 
    C ${center + 45} 35, ${center + 40} 0, ${center + 55} 0 
    H ${width - borderRadius}
    Q ${width} 0 ${width} ${borderRadius}
    V 70 
    H 0 
    Z
  `;

  return (
    <View style={styles.container}>
      {/* SVG Background - Có bo tròn góc ở 2 đầu rìa màn hình */}
      <Svg
        width={width}
        height={70}
        viewBox={`0 0 ${width} 70`}
        style={styles.svg}
      >
        <Path d={d} fill="#EEE9FF" />
      </Svg>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log("Add")}
      >
        <Plus size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Navigation Icons */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.iconButton}>
          <Home size={24} color="#5F33E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Calendar size={24} color="#5F33E1" />
        </TouchableOpacity>

        <View style={{ width: 60 }} />

        <TouchableOpacity style={styles.iconButton}>
          <FileText size={24} color="#5F33E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Map size={24} color="#5F33E1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: 95, 
    alignItems: "center",
    backgroundColor: "transparent",
  },
  svg: {
    position: "absolute",
    bottom: 0,
  },
  navRow: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconButton: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    position: "absolute",
    top: 0, 
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5F33E1",
    justifyContent: "center",
    alignItems: "center",
    
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
});