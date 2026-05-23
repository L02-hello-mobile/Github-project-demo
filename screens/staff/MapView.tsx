import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  PanResponder,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { MapPin, Plus, Minus } from "lucide-react-native";
import { ArrowIcon, NotificationIcon } from "../../components/Icons";
import { eventService } from "../../services/eventService";
import { taskService } from "../../services/taskService";
import { socketService } from "../../services/socketService";
import { useSocketNotification } from "../../context/SocketNotificationContext";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width - 48;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;
const MARKER_RADIUS = 19;
const MIN_SCALE = 1.0;
const MAX_SCALE = 3.5;

const PIN_X = 0.5 * IMAGE_WIDTH - MARKER_RADIUS;
const PIN_Y = 0.45 * IMAGE_HEIGHT - MARKER_RADIUS;

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

function pinchDistance(touches: { pageX: number; pageY: number }[]) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

const MARKER_COLORS: Record<string, string> = {
  TODO: "#9CA3AF",
  IN_PROGRESS: "#F97316",
  COMPLETED: "#16A34A",
  OVERDUE: "#DC2626",
};

export default function MapView_Staff() {
  const { unreadCount } = useSocketNotification();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId, taskId } = (route.params ?? {}) as {
    eventId?: string;
    taskId?: string;
  };

  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);

  const visibleTasks = (
    taskId ? tasks.filter((t) => t._id === taskId) : tasks
  ).filter((t) => t.mapCoordinates?.x != null);

  useFocusEffect(
    useCallback(() => {
      if (!eventId) return;
      setLoadingMap(true);
      Promise.all([
        eventService.getEventDetail(eventId),
        taskService.getEventTasks(eventId),
        taskId ? taskService.getTaskDetail(taskId) : Promise.resolve(null),
      ])
        .then(([eventRes, tasksRes, focusedTaskRes]) => {
          if (eventRes?.data) setMapImageUrl(eventRes.data.mapImageUrl ?? null);
          if (tasksRes?.data) {
            const nextTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
            const focusedTask = focusedTaskRes?.data;

            if (focusedTask?._id) {
              const taskExists = nextTasks.some(
                (t: any) => t._id === focusedTask._id,
              );
              setTasks(
                taskExists
                  ? nextTasks.map((t: any) =>
                      t._id === focusedTask._id ? { ...t, ...focusedTask } : t,
                    )
                  : [...nextTasks, focusedTask],
              );
            } else {
              setTasks(nextTasks);
            }
          }
        })
        .catch((e) => console.error("Failed to load map data:", e))
        .finally(() => setLoadingMap(false));
      socketService.joinEvent(eventId);
      socketService.onTaskStatusUpdated((data: any) => {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === data.taskId ? { ...t, status: data.status } : t,
          ),
        );
      });
      socketService.onTaskUpdated((data: any) => {
        const updatedTask = data?.task;
        if (!updatedTask?._id) return;
        setTasks((prev) =>
          prev.map((t) =>
            t._id === updatedTask._id ? { ...t, ...updatedTask } : t,
          ),
        );
      });
      socketService.onTaskDeleted((data: any) => {
        setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
      });
      return () => {
        socketService.leaveEvent(eventId);
        socketService.off("task:status-updated");
        socketService.off("task:updated");
        socketService.off("task:deleted");
      };
    }, [eventId, taskId]),
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleRef = useRef(1);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const txRef = useRef(0);
  const tyRef = useRef(0);

  const panStartX = useRef(0);
  const panStartY = useRef(0);

  // Pinch
  const pinchInitDist = useRef<number | null>(null);
  const pinchBaseScale = useRef(1);

  const setPan = (x: number, y: number) => {
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
    // Re-clamp pan so image never leaves the frame after scale change
    setPan(txRef.current, tyRef.current);
  };

  const animateScale = (s: number) => {
    const clamped = clamp(s, MIN_SCALE, MAX_SCALE);
    scaleRef.current = clamped;
    // Re-clamp translation immediately for the new scale
    setPan(txRef.current, tyRef.current);
    Animated.spring(scaleAnim, {
      toValue: clamped,
      useNativeDriver: true,
      bounciness: 2,
    }).start();
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        // Always snapshot current translation as base for this gesture
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
          // Lazy-init pinch if second finger added after grant
          if (pinchInitDist.current === null) {
            pinchInitDist.current = pinchDistance(touches as any);
            pinchBaseScale.current = scaleRef.current;
            panStartX.current = txRef.current;
            panStartY.current = tyRef.current;
            return;
          }
          const dist = pinchDistance(touches as any);
          applyScale(pinchBaseScale.current * (dist / pinchInitDist.current));
        } else if (touches.length === 1) {
          // Single finger: pan the map
          setPan(
            panStartX.current + gesture.dx,
            panStartY.current + gesture.dy,
          );
        }
      },

      // txRef/tyRef are always current from setPan calls â€” nothing extra needed
      onPanResponderRelease: () => {
        pinchInitDist.current = null;
      },
      onPanResponderTerminate: () => {
        pinchInitDist.current = null;
      },
    }),
  ).current;

  return (
    <ImageBackground
      source={require("../../assets/bgSplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon color="#1F2937" size={22} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {"B\u1ea3n \u0111\u1ed3 nhi\u1ec7m v\u1ee5"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
          style={{ position: "relative" }}
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

      {/* Map container */}
      <View style={styles.mapOuter}>
        <View style={styles.mapWrapper} {...responder.panHandlers}>
          {/*
            translate FIRST, then scale:
            clamping is in untransformed coords, scale magnifies around center
          */}
          <Animated.View
            style={[
              styles.mapContent,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <ImageBackground
              source={
                mapImageUrl
                  ? { uri: mapImageUrl }
                  : require("../../assets/bgSplash.png")
              }
              style={styles.mapImage}
              imageStyle={{ borderRadius: 20 }}
            >
              {loadingMap && (
                <ActivityIndicator
                  size="large"
                  color="#5F33E1"
                  style={{ flex: 1 }}
                />
              )}
              {visibleTasks.map((t) => {
                const markerColor =
                  MARKER_COLORS[t.status] ?? MARKER_COLORS.TODO;
                const isFocusedTask = t._id === taskId;
                const label = t.mapCoordinates?.label?.trim();
                const hasLabel = isFocusedTask && !!label;
                return (
                  <View
                    key={t._id}
                    style={{
                      position: "absolute",
                      left: (t.mapCoordinates.x / 100) * IMAGE_WIDTH - 70,
                      top:
                        (t.mapCoordinates.y / 100) * IMAGE_HEIGHT -
                        38 -
                        (hasLabel ? 30 : 0),
                      width: 140,
                      alignItems: "center",
                      zIndex: isFocusedTask ? 10 : 1,
                    }}
                  >
                    {hasLabel && (
                      <View style={styles.labelBubble}>
                        <Text style={styles.labelBubbleText} numberOfLines={2}>
                          {label}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isFocusedTask && <View style={styles.markerRing} />}
                      <MapPin
                        size={38}
                        color={markerColor}
                        fill={markerColor}
                      />
                    </View>
                  </View>
                );
              })}
            </ImageBackground>
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
        {
          "K\u00e9o \u0111\u1ec3 di chuy\u1ec3n \u2022 Ch\u1ee5m \u0111\u1ec3 thu ph\u00f3ng"
        }
      </Text>

      {/* Close button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.closeButton}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>{"\u0110\u00f3ng"}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 62,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },

  mapOuter: {
    alignSelf: "center",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  mapWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mapContent: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },

  markerContainer: {
    position: "absolute",
    alignItems: "center",
    width: 140,
  },
  markerRing: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(124,58,237,0.18)",
    top: -7,
    left: -7,
  },
  labelBubble: {
    backgroundColor: "rgba(17,24,39,0.92)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
    maxWidth: 140,
  },
  labelBubbleText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: "LexendDeca_400Regular",
    textAlign: "center",
    lineHeight: 15,
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

  hint: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "LexendDeca_400Regular",
    color: "#6B7280",
  },

  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
  },
  closeButton: {
    backgroundColor: "#5F33E1",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#FFFFFF",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -6,
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
});
