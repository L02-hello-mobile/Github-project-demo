import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    image: require("../assets/splash.png"),
    title: "Tạo bản đồ sự kiện nhanh chóng",
    subtitle:
      "Chuyển đổi bản vẽ giấy thành bản đồ tương tác thời gian thực chỉ với 2 bước",
  },
  {
    image: require("../assets/splash1.png"),
    title: "Quản lý theo tọa độ",
    subtitle:
      "Chạm để thả Marker và tạo Task ngay tại vị trí thực tế, giúp xóa bỏ sự mơ hồ về không gian",
  },
  {
    image: require("../assets/splash2.png"),
    title: "Định vị nhanh, làm việc chuẩn",
    subtitle:
      "Hệ thống tự động phóng to vào vị trí Marker ngay khi bạn nhấn vào thông báo nhắc việc",
  },
];

export default function WalkthroughScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (index < slides.length - 1) {
      const next = index + 1;
      flatListRef.current?.scrollToOffset({
        offset: next * width,
        animated: true,
      });
      setIndex(next);
    } else {
      navigation.replace("Onboarding");
    }
  };

  const handleSkip = () => {
    navigation.replace("Onboarding");
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  return (
    <ImageBackground
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.counter}>
          {index + 1}/{slides.length}
        </Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skip}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.nextBtn}>
            {index < slides.length - 1 ? "Tiếp theo" : "Bắt đầu"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 10,
  },
  counter: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },
  skip: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#5F33E1",
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  image: {
    width: width * 0.82,
    height: width * 0.82,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
    marginBottom: 14,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "LexendDeca_400Regular",
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: "#5F33E1",
    borderRadius: 4,
  },
  nextBtn: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#5F33E1",
  },
});
