import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  HomeIcon,
  CalendarIcon,
  AddIcon,
  DocumentIcon,
  MapIcon,
} from "./Icons";

const tabs = [
  { name: "Home", fab: false, SvgIcon: HomeIcon },
  { name: "Calendar", fab: false, SvgIcon: CalendarIcon },
  { name: "Add", fab: true, SvgIcon: AddIcon },
  { name: "Documents", fab: false, SvgIcon: DocumentIcon },
  { name: "Map", fab: false, SvgIcon: MapIcon },
];

export default function BottomTab({ state, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bottomFill} />
      <View style={styles.bottomTab}>
        {tabs.map((tab) => {
          if (tab.fab) {
            return (
              <TouchableOpacity
                key="Add"
                style={styles.fab}
                activeOpacity={0.8}
              >
                <tab.SvgIcon color="#FFF" />
              </TouchableOpacity>
            );
          }
          const routeIndex = state.routes.findIndex(
            (r: any) => r.name === tab.name,
          );
          const isFocused = state.index === routeIndex;
          const iconColor = isFocused ? "#6366F1" : "#9CA3AF";
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => routeIndex >= 0 && navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <tab.SvgIcon color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFF",
  },
  bottomFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "#FFF",
  },
  bottomTab: {
    height: 85,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    boxShadow: "0px -2px 10px rgba(0,0,0,0.06)",
  },
  tabIcon: { width: 24, height: 24 },
  tabIconLg: { width: 28, height: 28 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366F1",
    marginTop: -50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
