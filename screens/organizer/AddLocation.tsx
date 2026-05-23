import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";

import { MapPin, Trash2, Plus, Minus } from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import { eventService } from "../../services/eventService";
import { useSocketNotification } from "../../context/SocketNotificationContext";

const { width } = Dimensions.get("window");

const IMAGE_WIDTH = width - 30;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.7;
const MARKER_RADIUS = 19;
const MIN_SCALE = 1.0;
const MAX_SCALE = 3.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function pinchDistance(touches: { pageX: number; pageY: number }[]) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function MapEditorScreen({ route }: { route?: any }) {
  const { unreadCount } = useSocketNotification();
  const eventId: string | undefined = route?.params?.eventId;
  const [markers, setMarkers] = useState<any[]>(() => {
    const c = route?.params?.existingCoords;
    if (!c || c.x == null) return [];
    return [
      {
        id: "task-marker",
        xPercent: c.x / 100,
        yPercent: c.y / 100,
        label: c.label || "",
      },
    ];
  });
  const [mapImageUrl, setMapImageUrl] = useState<string | undefined>(undefined);
  const [imageLayout, setImageLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  });
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const [labelingMarkerId, setLabelingMarkerId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const panResponders = useRef<Record<string, any>>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!eventId) return;
    eventService.getEventDetail(eventId).then((res) => {
      if (res?.data?.mapImageUrl) {
        setMapImageUrl(res.data.mapImageUrl);
      }
    });
  }, [eventId]);

  // ===== ZOOM / PAN STATE =====
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleRef = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const pinchInitDist = useRef<number | null>(null);
  const pinchBaseScale = useRef(1);

  const setMapPan = (x: number, y: number) => {
    const s = scaleRef.current;
    const maxX = (IMAGE_WIDTH * (s - 1)) / (2 * s);
    const maxY = (IMAGE_HEIGHT * (s - 1)) / (2 * s);
    const cx = clamp(x, -maxX, maxX);
    const cy = clamp(y, -maxY, maxY);
    translateX.setValue(cx);
    translateY.setValue(cy);
    txRef.current = cx;
    tyRef.current = cy;
  };

  const applyScale = (s: number) => {
    const clamped = clamp(s, MIN_SCALE, MAX_SCALE);
    scaleRef.current = clamped;
    scaleAnim.setValue(clamped);
    setMapPan(txRef.current, tyRef.current);
  };

  const animateScale = (s: number) => {
    const clamped = clamp(s, MIN_SCALE, MAX_SCALE);
    scaleRef.current = clamped;
    setMapPan(txRef.current, tyRef.current);
    Animated.spring(scaleAnim, {
      toValue: clamped,
      useNativeDriver: true,
      bounciness: 2,
    }).start();
  };

  // 2-finger pan/pinch on map background
  const mapResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) =>
        evt.nativeEvent.touches.length >= 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length >= 2,

      onPanResponderGrant: (evt) => {
        panStartX.current = txRef.current;
        panStartY.current = tyRef.current;
        if (evt.nativeEvent.touches.length >= 2) {
          pinchInitDist.current = pinchDistance(evt.nativeEvent.touches as any);
          pinchBaseScale.current = scaleRef.current;
        }
      },

      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          if (pinchInitDist.current === null) {
            pinchInitDist.current = pinchDistance(touches as any);
            pinchBaseScale.current = scaleRef.current;
            panStartX.current = txRef.current;
            panStartY.current = tyRef.current;
            return;
          }
          const dist = pinchDistance(touches as any);
          applyScale(pinchBaseScale.current * (dist / pinchInitDist.current));
        }
        // Pan with 2 fingers too
        setMapPan(
          panStartX.current + gesture.dx,
          panStartY.current + gesture.dy,
        );
      },

      onPanResponderRelease: () => {
        pinchInitDist.current = null;
      },
      onPanResponderTerminate: () => {
        pinchInitDist.current = null;
      },
    }),
  ).current;
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

    // Single marker mode: replace existing
    const newMarker = {
      id: "task-marker",
      xPercent,
      yPercent,
      label: "",
    };
    setMarkers([newMarker]);
    setSelectedMarkerId("task-marker");
  };

  // =========================
  // DELETE MARKER
  // =========================
  const deleteMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));

    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  // =========================
  // UPDATE POSITION
  // =========================
  const updateMarkerPosition = (id: string, x: number, y: number) => {
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
          : marker,
      ),
    );
  };

  const handleMarkerTap = (id: string) => {
    const marker = markers.find((m) => m.id === id);
    setSelectedMarkerId(id);
    setLabelInput(marker?.label ?? "");
    setLabelingMarkerId(id);
  };

  const saveLabel = () => {
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === labelingMarkerId ? { ...m, label: labelInput.trim() } : m,
      ),
    );
    setLabelingMarkerId(null);
    setLabelInput("");
  };

  const handleMarkerDrag = (id: string, pageX: number, pageY: number) => {
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
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bản đồ sự kiện</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("Notification")}
        >
          <NotificationIcon color="#1F2937" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapOuter} {...mapResponder.panHandlers}>
        <View style={styles.mapClip}>
          <Animated.View
            style={[
              styles.mapTransform,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Pressable
              onPress={handleAddMarker}
              style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
              onLayout={(event) => setImageLayout(event.nativeEvent.layout)}
            >
              <ImageBackground
                source={
                  mapImageUrl
                    ? { uri: mapImageUrl }
                    : require("../../assets/bgSplash.png")
                }
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
                      onPress={() => handleMarkerTap(marker.id)}
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
                      {!!marker.label && (
                        <View style={styles.labelBubble}>
                          <Text
                            style={styles.labelBubbleText}
                            numberOfLines={1}
                          >
                            {marker.label}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ImageBackground>
            </Pressable>
          </Animated.View>
        </View>

        {/* Zoom buttons */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomBtn}
            activeOpacity={0.8}
            onPress={() => animateScale(scaleRef.current + 0.3)}
          >
            <Plus size={18} color="#5F33E1" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            activeOpacity={0.8}
            onPress={() => animateScale(scaleRef.current - 0.3)}
          >
            <Minus size={18} color="#5F33E1" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.hint}>
        Tap để thêm • Chạm marker để đặt nhãn • Kéo để di chuyển • Giữ để xóa
      </Text>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          if (markers.length === 0) {
            navigation.goBack();
            return;
          }
          const m = markers[0];
          const mapCoordinates = {
            x: Math.round(m.xPercent * 100),
            y: Math.round(m.yPercent * 100),
            label: m.label || "",
          };
          navigation.navigate("AddTask", { eventId, mapCoordinates });
        }}
      >
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>

      {/* Label input modal */}
      <Modal visible={!!labelingMarkerId} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.labelOverlay}
        >
          <View style={styles.labelSheet}>
            <Text style={styles.labelSheetTitle}>Đặt nhãn cho điểm</Text>
            <TextInput
              style={styles.labelSheetInput}
              placeholder="Nhập tên / mô tả..."
              placeholderTextColor="#B0AEC8"
              value={labelInput}
              onChangeText={setLabelInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveLabel}
            />
            <View style={styles.labelSheetActions}>
              <TouchableOpacity
                style={styles.labelCancelBtn}
                onPress={() => {
                  setLabelingMarkerId(null);
                  setLabelInput("");
                }}
              >
                <Text style={styles.labelCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.labelSaveBtn} onPress={saveLabel}>
                <Text style={styles.labelSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  mapOuter: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  mapClip: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
  },
  mapTransform: {
    width: "100%",
    height: "100%",
  },

  zoomControls: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
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

  // Label bubble on marker
  labelBubble: {
    position: "absolute",
    top: -22,
    left: "50%",
    transform: [{ translateX: -30 }],
    backgroundColor: "#5F33E1",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    width: 60,
    alignItems: "center",
  },
  labelBubbleText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },

  // Label input modal
  labelOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  labelSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  labelSheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1D1E",
    marginBottom: 14,
  },
  labelSheetInput: {
    borderWidth: 1.5,
    borderColor: "#5F33E1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1D1E",
    marginBottom: 16,
  },
  labelSheetActions: {
    flexDirection: "row",
    gap: 12,
  },
  labelCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  labelCancelText: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  labelSaveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#5F33E1",
    alignItems: "center",
  },
  labelSaveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
  },
});
