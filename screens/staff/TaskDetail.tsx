import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowIcon,
  CalendarIcon,
  NotificationIcon,
  MapIcon,
} from "../../components/Icons";
import { Users, ImageIcon } from "lucide-react-native";
import { taskService } from "../../services/taskService";
import { uploadService } from "../../services/uploadService";
import { eventService } from "../../services/eventService";

import { socketService } from "../../services/socketService";
import { useSocketNotification } from "../../context/SocketNotificationContext";
const formatDate = (isoString?: string): string => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}, ${d.getFullYear()}  ${h}:${minutes} ${ampm}`;
};

export default function TaskDetail_Staff() {
  const { unreadCount } = useSocketNotification();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId: string = route.params?.taskId ?? "";

  const [taskData, setTaskData] = useState<any>(null);
  const [groupName, setGroupName] = useState("—");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!taskId) return;
      setLoading(true);
      taskService
        .getTaskDetail(taskId)
        .then(async (res) => {
          if (!res?.data) return;
          const nextTask = res.data;
          setTaskData(nextTask);

          if (typeof nextTask.group === "object") {
            setGroupName(nextTask.group?.name || nextTask.group?.label || "—");
            return;
          }

          if (typeof nextTask.group === "string") {
            const eventId = nextTask?.event?._id ?? nextTask?.event;
            if (!eventId) {
              setGroupName(nextTask.group);
              return;
            }

            try {
              const eventRes = await eventService.getEventDetail(eventId);
              const matchedGroup = (eventRes?.data?.groups ?? []).find(
                (group: any) => group._id === nextTask.group,
              );
              setGroupName(matchedGroup?.name || nextTask.group);
            } catch {
              setGroupName(nextTask.group);
            }
            return;
          }

          setGroupName("—");
        })
        .catch((e) => console.error("Failed to fetch task:", e))
        .finally(() => setLoading(false));
    }, [taskId]),
  );

  useFocusEffect(
    useCallback(() => {
      const eventId = taskData?.event?._id ?? taskData?.event;
      if (!eventId || !taskId) return;

      socketService.joinEvent(eventId);
      socketService.onTaskUpdated((data: any) => {
        const updatedTask = data?.task;
        if (updatedTask?._id === taskId) {
          setTaskData((prev: any) => ({ ...prev, ...updatedTask }));
        }
      });
      socketService.onTaskStatusUpdated((data: any) => {
        if (data?.taskId === taskId) {
          setTaskData((prev: any) => ({ ...prev, status: data.status }));
        }
      });

      return () => {
        socketService.leaveEvent(eventId);
        socketService.off("task:updated");
        socketService.off("task:status-updated");
      };
    }, [taskData?.event, taskId]),
  );

  const title = taskData?.title ?? "—";
  const description = taskData?.description ?? "—";
  const startDate = formatDate(taskData?.startTime);
  const endDate = formatDate(taskData?.endTime);
  const taskStatus = taskData?.status ?? "TODO";
  const isStarted = taskStatus === "IN_PROGRESS" || taskStatus === "COMPLETED";
  const isCompleted = taskStatus === "COMPLETED";

  const handleAcceptTask = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await taskService.updateTaskStatus(taskId, {
        status: "IN_PROGRESS",
      });
      if (res?.data) setTaskData(res.data);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể nhận nhiệm vụ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!uploadedProofUrl || submitting) return;
    setSubmitting(true);
    try {
      const res = await taskService.updateTaskStatus(taskId, {
        status: "COMPLETED",
        proofImage: uploadedProofUrl,
      });
      if (res?.data) setTaskData(res.data);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể hoàn thành nhiệm vụ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadProof(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập", "Vui lòng cho phép sử dụng camera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await uploadProof(result.assets[0].uri);
    }
  };

  const uploadProof = async (uri: string) => {
    setLocalImageUri(uri);
    setUploadedProofUrl(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "proof.jpg",
        type: "image/jpeg",
      } as any);
      const uploadRes = await uploadService.uploadImage(formData);
      const url = uploadRes?.imageUrl ?? uploadRes?.data?.imageUrl;
      if (!url) throw new Error("Không lấy được URL");
      setUploadedProofUrl(url);
    } catch (err: any) {
      Alert.alert(
        "Lỗi upload",
        err?.message || "Upload ảnh thất bại. Vui lòng thử lại.",
      );
      setLocalImageUri(null);
    } finally {
      setUploading(false);
    }
  };

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
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
          <NotificationIcon color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        {/* Group card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Users size={18} color="#5F33E1" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.label}>Nhóm</Text>
              <Text style={styles.valueText}>{groupName}</Text>
            </View>
          </View>
        </View>

        {/* Task name card */}
        <View style={styles.card}>
          <Text style={styles.label}>Nhiệm vụ</Text>
          <Text style={styles.valueText}>{title}</Text>
        </View>

        {/* Description card */}
        <View style={styles.card}>
          <Text style={styles.label}>Mô tả</Text>
          <Text style={styles.descText}>{description}</Text>
        </View>

        {/* Date range card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <CalendarIcon color="#5F33E1" size={28} />
            <View style={styles.cardBody}>
              <Text style={styles.label}>Ngày bắt đầu - Ngày kết thúc</Text>
              <Text style={styles.valueText}>
                {startDate} - {endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Map card */}
        <View style={[styles.card, styles.actionCard]}>
          <MapIcon color="#5F33E1" size={40} />
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate("MapViewStaff", {
                eventId: taskData?.event?._id ?? taskData?.event ?? "",
                taskId,
              })
            }
          >
            <Text style={styles.actionButtonText}>Xem bản đồ</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence card — chỉ hiện khi IN_PROGRESS hoặc COMPLETED */}
        {isStarted && (
          <View style={styles.card}>
            <View style={styles.actionCard}>
              <View style={styles.iconBox}>
                <ImageIcon size={18} color="#5F33E1" />
              </View>
              <Text style={styles.evidenceLabel}>Minh chứng hoàn thành</Text>
              {!isCompleted && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={handleTakePhoto}
                    disabled={uploading}
                  >
                    <Text style={styles.actionButtonText}>Chụp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={handlePickImage}
                    disabled={uploading}
                  >
                    <Text style={styles.actionButtonText}>Chọn ảnh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {uploading && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator size="small" color="#5F33E1" />
                <Text style={styles.uploadingText}>Đang upload...</Text>
              </View>
            )}
            {localImageUri && !uploading && (
              <View style={{ marginTop: 12 }}>
                <Image
                  source={{ uri: localImageUri }}
                  style={styles.evidenceThumb}
                />
                {uploadedProofUrl ? (
                  <Text style={styles.uploadOkText}>✓ Upload thành công</Text>
                ) : (
                  <Text style={styles.uploadFailText}>✗ Upload thất bại</Text>
                )}
              </View>
            )}
            {isCompleted && taskData?.proofImage && !localImageUri && (
              <Image
                source={{ uri: taskData.proofImage }}
                style={[styles.evidenceThumb, { marginTop: 12 }]}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom action button */}
      <View style={styles.bottomArea}>
        {!isStarted ? (
          <TouchableOpacity
            style={[styles.startButton, submitting && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleAcceptTask}
            disabled={submitting}
          >
            <Text style={styles.startButtonText}>
              {submitting ? "Đang xử lý..." : "Nhận nhiệm vụ"}
            </Text>
          </TouchableOpacity>
        ) : isCompleted ? (
          <View style={[styles.startButton, { opacity: 0.6 }]}>
            <Text style={styles.startButtonText}>Đã hoàn thành</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.startButton,
              (!uploadedProofUrl || submitting || uploading) && {
                opacity: 0.45,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleCompleteTask}
            disabled={!uploadedProofUrl || submitting || uploading}
          >
            <Text style={styles.startButtonText}>
              {submitting ? "Đang xử lý..." : "Hoàn thành nhiệm vụ"}
            </Text>
          </TouchableOpacity>
        )}
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

  scrollArea: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "LexendDeca_400Regular",
    marginBottom: 3,
  },
  valueText: {
    fontSize: 15,
    fontFamily: "LexendDeca_700Bold",
    color: "#1F2937",
  },
  descText: {
    fontSize: 13,
    fontFamily: "LexendDeca_400Regular",
    color: "#374151",
    lineHeight: 21,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "LexendDeca_700Bold",
    color: "#5F33E1",
  },
  evidenceLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "LexendDeca_400Regular",
    color: "#1F2937",
    marginLeft: 12,
  },
  evidenceScroll: {
    marginTop: 14,
  },
  evidenceThumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  uploadingText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "LexendDeca_400Regular",
  },
  uploadOkText: {
    fontSize: 12,
    color: "#16A34A",
    fontFamily: "LexendDeca_400Regular",
    marginTop: 6,
  },
  uploadFailText: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "LexendDeca_400Regular",
    marginTop: 6,
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
  startButton: {
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
  startButtonText: {
    fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
    color: "#FFFFFF",
  },
});
