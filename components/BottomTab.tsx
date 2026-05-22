import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  HomeIcon,
  CalendarIcon,
  AddIcon,
  DocumentIcon,
  MapIcon,
} from "./Icons";

const TAB_HEIGHT = 60;
const FAB_SIZE = 60;
const FAB_PEEK = FAB_SIZE / 2; // = 30: FAB center sits at tab top edge
const CORNER_R = 26;
const NOTCH_R = FAB_SIZE / 2 + 6; // = 36: slightly wider than FAB
const BG = "#EEE9FF";

const tabs = [
  { name: "Home", fab: false, SvgIcon: HomeIcon },
  { name: "Calendar", fab: false, SvgIcon: CalendarIcon },
  { name: "Add", fab: true, SvgIcon: AddIcon },
  { name: "Documents", fab: false, SvgIcon: DocumentIcon },
  { name: "Map", fab: false, SvgIcon: MapIcon },
];

export default function BottomTab({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  const totalH = TAB_HEIGHT + FAB_PEEK; // = 98
  const cx = width / 2;
  const ty = FAB_PEEK; // y of the tab bar's flat top edge
  const cr = CORNER_R;
  const nr = NOTCH_R;

  // Flat top with concave arc notch in the center + rounded top corners
  const d = [
    `M ${cr} ${ty}`,
    `L ${cx - nr} ${ty}`,
    `A ${nr} ${nr} 0 0 0 ${cx + nr} ${ty}`, // concave notch (sweep=0 → bows downward)
    `L ${width - cr} ${ty}`,
    `Q ${width} ${ty} ${width} ${ty + cr}`,
    `L ${width} ${totalH}`,
    `L 0 ${totalH}`,
    `L 0 ${ty + cr}`,
    `Q 0 ${ty} ${cr} ${ty}`,
    `Z`,
  ].join(" ");

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
      }}
    >
      <View style={{ height: totalH }}>
        {/* Notched background shape */}
        <Svg width={width} height={totalH} style={StyleSheet.absoluteFill}>
          <Path d={d} fill={BG} />
        </Svg>

        {/* FAB — center sits at y = FAB_PEEK = tab top edge */}
        <View style={styles.fabWrap}>
          <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
            <AddIcon color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Tab icons row anchored to the bottom of the container */}
        <View style={styles.row}>
          {tabs.map((tab) => {
            if (tab.fab) {
              return <View key="Add" style={{ flex: 1 }} />;
            }
            const routeIndex = state.routes.findIndex(
              (r: any) => r.name === tab.name,
            );
            const isFocused = state.index === routeIndex;
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => routeIndex >= 0 && navigation.navigate(tab.name)}
                activeOpacity={0.7}
                style={styles.tabBtn}
              >
                <tab.SvgIcon color={isFocused ? "#6366F1" : "#A5A0C8"} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Safe-area fill */}
      <View style={{ height: Math.max(bottom, 16), backgroundColor: BG }} />
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  row: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
