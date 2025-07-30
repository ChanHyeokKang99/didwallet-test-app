import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthButton } from "../components/AuthButton";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { useThemeColor } from "../hooks/useThemeColor";

// 샘플 데이터에서 티켓 찾기 (실제로는 API 호출)
import restful from "@/services/Restful";
import { RootStackParamList, Ticket } from "./HomeScreen";

type TicketDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TicketDetail">;
  route: RouteProp<RootStackParamList, "TicketDetail">;
};

export default function TicketDetailScreen({ route, navigation }: TicketDetailScreenProps) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");
  const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");
  const borderColor = useThemeColor({ light: "#E5E9F0", dark: "#2C3235" }, "text");

  // 티켓 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bgColor: "#E6F7E9", textColor: "#228B22" }; // 활성: 연두색 배경, 진한 녹색 텍스트
      case "upcoming":
        return { bgColor: "#E0F2F7", textColor: "#2196F3" }; // 예정: 연한 하늘색 배경, 파란색 텍스트
      case "used":
        return { bgColor: "#F0F0F0", textColor: "#757575" }; // 사용됨: 밝은 회색 배경, 중간 회색 텍스트
      case "completed":
        return { bgColor: "#E8F5E9", textColor: "#607D8B" }; // 완료됨: 매우 연한 녹색-회색 배경, 청회색 텍스트
      case "expired":
        return { bgColor: "#FCE4EC", textColor: "#D32F2F" }; // 만료됨: 연한 분홍색 배경, 진한 빨간색 텍스트
      case "cancelled":
        return { bgColor: "#FCE4EC", textColor: "#D32F2F" }; // 취소됨: 연한 분홍색 배경, 진한 빨간색 텍스트
      default:
        return { bgColor: "#F0F0F0", textColor: "#757575" }; // 기본값: 밝은 회색 배경, 중간 회색 텍스트
    }
  };

  // 티켓 타입에 따른 아이콘 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case "concert":
        return "#7C3AED";
      case "movie":
        return "#2563EB";
      case "sports":
        return "#16A34A";
      case "exhibition":
        return "#EA580C";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "유효함";
      case "used":
        return "사용됨";
      case "expired":
        return "만료됨";
      case "cancelled":
        return "취소됨";
      case "completed":
        return "완료됨";
      case "upcoming":
        return "예정됨";
      default:
        return "알 수 없음";
    }
  };

  // 티켓 데이터 로드
  useEffect(() => {
    const loadTicket = async () => {
      try {
        // 실제로는 API 호출
        const res = await restful("GET", "/booking/" + ticketId, {});
        if (res.data) {
          setTicket(res.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("티켓 로딩 오류:", error);
        setLoading(false);
      }
    };

    if (ticketId) {
      loadTicket();
    } else {
      setLoading(false);
    }
  }, [ticketId]);

  const handleGenerateQR = () => {
    if (ticket?.status !== "active") {
      Alert.alert("알림", "유효한 티켓만 QR 코드를 생성할 수 있습니다.");
      return;
    }

    // 입장 QR 생성 화면으로 이동
    navigation.navigate("TicketQR", { ticketId: ticket.id });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>티켓 정보를 불러오는 중...</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!ticket) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>티켓 상세</ThemedText>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.notFoundContainer}>
            <ThemedText style={styles.notFoundText}>티켓을 찾을 수 없습니다.</ThemedText>
            <AuthButton title="돌아가기" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const statusColors = getStatusColor(ticket.status);
  const typeColor = getTypeColor(ticket.type);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>티켓 상세</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.ticketContainer}>
            {/* 티켓 상태 및 타입 */}
            <View style={styles.statusContainer}>
              <View style={[styles.typeTag, { backgroundColor: `${typeColor}20` }]}>
                <ThemedText style={[styles.typeText, { color: typeColor }]}>{ticket.type}</ThemedText>
              </View>
              <View style={[styles.statusTag, { backgroundColor: statusColors.bgColor }]}>
                <ThemedText style={[styles.statusText, { color: statusColors.textColor }]}>
                  {getStatusText(ticket.status)}
                </ThemedText>
              </View>
            </View>

            {/* 티켓 제목 */}
            <ThemedText style={styles.ticketTitle}>{ticket.title}</ThemedText>

            {/* 티켓 정보 */}
            <View style={[styles.infoCard, { borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>날짜</ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.date}</ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>장소</ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.location}</ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>좌석</ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.seat}</ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>발급처</ThemedText>
                <ThemedText style={styles.infoValue}>{ticket.issuer}</ThemedText>
              </View>
            </View>

            {/* 안내 사항 */}
            <View style={styles.noticeContainer}>
              <ThemedText style={styles.noticeTitle}>입장 안내</ThemedText>
              <ThemedText style={styles.noticeText}>
                • 입장 시 QR 코드를 생성하여 게이트에서 스캔해주세요.{"\n"}• QR 코드는 생성 후 3분간 유효합니다.{"\n"}•
                입장 후에는 티켓 상태가 (사용됨) 으로 변경됩니다.{"\n"}• 한 번 사용된 티켓은 재사용이 불가능합니다.
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.buttonContainer}>
            <AuthButton title="입장 QR 생성하기" onPress={handleGenerateQR} disabled={ticket.status !== "active"} />
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  ticketContainer: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    width: "100%",
    opacity: 0.5,
  },
  noticeContainer: {
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  bottomSafeArea: {
    backgroundColor: "transparent",
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "android" ? 50 : 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
