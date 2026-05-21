import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { ArrowIcon } from "../components/Icons";

const { width } = Dimensions.get("window");

export default function StartScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Gradient blobs background */}
        <View style={styles.blobTopLeft} />
        <View style={styles.blobTopRight} />

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../assets/letStart.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Text */}
        <Text style={styles.title}>EventFlow</Text>
        <Text style={styles.subtitle}>Map your task, Flow your Event</Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation?.navigate("Walkthrough")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Khám Phá</Text>
          <ArrowIcon color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  blobTopLeft: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#C4B5FD",
    opacity: 0.35,
  },
  blobTopRight: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#D9F99D",
    opacity: 0.45,
  },
  illustrationContainer: {
    width: width * 0.85,
    height: width * 0.85,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "LexendDeca_400Regular",
    color: "#6B7280",
    marginBottom: 50,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#5F33E1",
    width: 331,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: width * 0.14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    boxShadow: "0px 4px 12px rgba(95, 51, 225, 0.35)",
  },
  buttonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "LexendDeca_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  buttonArrowIcon: {
    width: 18,
    height: 18,
    transform: [{ rotate: "180deg" }],
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
