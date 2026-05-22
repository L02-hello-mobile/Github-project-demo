import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
  Text,
  TouchableOpacity,
  PanResponder,
  LayoutRectangle,
} from "react-native";

import {
  MapPin,
  Trash2,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import ArrowIcon from "../../components/Icon/LeftArrow";
import BellIcon from "../../components/Icon/Notification";

const { width } = Dimensions.get("window");

const IMAGE_WIDTH = width - 30;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.7;
const MARKER_RADIUS = 19;

export default function MapEditorScreen() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [imageLayout, setImageLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  });
  const [selectedMarkerId, setSelectedMarkerId] =
    useState<string | null>(null);
  const [draggingMarkerId, setDraggingMarkerId] =
    useState<string | null>(null);
  const panResponders = useRef<Record<string, any>>({});
  const navigation = useNavigation<any>();
  // =========================
  // ADD MARKER
  // =========================
  const handleAddMarker = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const width = imageLayout.width || IMAGE_WIDTH;
    const height = imageLayout.height || IMAGE_HEIGHT;

    const x = clamp(locationX, MARKER_RADIUS, width - MARKER_RADIUS);
    const y = clamp(locationY, MARKER_RADIUS, height - MARKER_RADIUS);
    const xPercent = x / width;
    const yPercent = y / height;

    const newMarker = {
      id: Date.now().toString(),
      xPercent,
      yPercent,
    };

    setMarkers((prev) => [...prev, newMarker]);
  };

  // =========================
  // DELETE MARKER
  // =========================
  const deleteMarker = (id: string) => {
    setMarkers((prev) =>
      prev.filter((m) => m.id !== id)
    );

    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  // =========================
  // UPDATE POSITION
  // =========================
  const updateMarkerPosition = (
    id: string,
    x: number,
    y: number
  ) => {
    const width = imageLayout.width || IMAGE_WIDTH;
    const height = imageLayout.height || IMAGE_HEIGHT;
    const clampedX = clamp(x, MARKER_RADIUS, width - MARKER_RADIUS);
    const clampedY = clamp(y, MARKER_RADIUS, height - MARKER_RADIUS);
    const xPercent = clampedX / width;
    const yPercent = clampedY / height;

    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id
          ? {
            ...marker,
            xPercent,
            yPercent,
          }
          : marker
      )
    );
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleMarkerDrag = (
    id: string,
    pageX: number,
    pageY: number
  ) => {
    const x = clamp(pageX - imageLayout.x, 0, imageLayout.width);
    const y = clamp(pageY - imageLayout.y, 0, imageLayout.height);
    updateMarkerPosition(id, x, y);
  };

  const getPanHandlers = (markerId: string) => {
    if (panResponders.current[markerId]) {
      return panResponders.current[markerId].panHandlers;
    }

    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedMarkerId(markerId);
        setDraggingMarkerId(markerId);
      },
      onPanResponderMove: (_, gestureState) => {
        handleMarkerDrag(markerId, gestureState.moveX, gestureState.moveY);
      },
      onPanResponderRelease: () => setDraggingMarkerId(null),
      onPanResponderTerminate: () => setDraggingMarkerId(null),
    });

    panResponders.current[markerId] = responder;
    return responder.panHandlers;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowIcon size={0.07 * width} color="#24252C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bản đồ sự kiện</Text>

        <TouchableOpacity style={styles.headerButton} onPress={() => alert("Đi tới màn hình thông báo!")}>
          <BellIcon size={0.07 * width} color="#24252C" hasNotification={true} />
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={handleAddMarker}
        style={{
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
        }}
        onLayout={(event) => setImageLayout(event.nativeEvent.layout)}
      >
        <ImageBackground
          source={{ uri: "https://picsum.photos/900/700" }}
          style={styles.image}
          imageStyle={{ borderRadius: 20 }}
        >
          {/* MARKERS */}
          {markers.map((marker) => {
            const isSelected = selectedMarkerId === marker.id;
            const imageWidth = imageLayout.width || IMAGE_WIDTH;
            const imageHeight = imageLayout.height || IMAGE_HEIGHT;
            const left = marker.xPercent * imageWidth - MARKER_RADIUS;
            const top = marker.yPercent * imageHeight - MARKER_RADIUS;

            const panHandlers = getPanHandlers(marker.id);

            return (
              <Pressable
                key={marker.id}
                onPress={() => setSelectedMarkerId(marker.id)}
                onLongPress={() => deleteMarker(marker.id)}
                hitSlop={10}
                style={[
                  styles.marker,
                  { left, top, zIndex: isSelected ? 2 : 1 },
                ]}
                {...panHandlers}
              >
                {isSelected && <View style={styles.selectedRing} />}

                <MapPin
                  size={38}
                  color={isSelected ? "#7C3AED" : "#FF4D4F"}
                  fill={isSelected ? "#7C3AED" : "#FF4D4F"}
                />
              </Pressable>
            );
          })}
        </ImageBackground>
      </Pressable>

      <Text style={styles.hint}>
        Tap để thêm • Kéo để di chuyển •
        Giữ để xoá
      </Text>

      <TouchableOpacity style={styles.confirmButton} onPress={() => alert("Vị trí đã được xác nhận")}>
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#24252C",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
    width: "100%",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#24252C",
    textAlign: "center",
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  marker: {
    position: "absolute",
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRing: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(124,58,237,0.2)",
    top: -7,
    left: -7,
  },

  hint: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#5F33E1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});