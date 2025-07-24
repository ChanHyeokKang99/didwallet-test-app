import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { AuthButton } from "../components/AuthButton";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { TicketList } from "../components/TicketList";
import { VCDebugPanel } from "../components/VCDebugPanel";
import { useThemeColor } from "../hooks/useThemeColor";
import { getVCs } from "../services/VCService";

// 티켓 타입 정의
export interface Ticket {
  id: string;
  title: string;
  date: string;
  location: string;
  seat: string;
  issuer: string;
  status: "active" | "used" | "expired";
  type: "concert" | "movie" | "sports" | "exhibition" | string;
}

// 네비게이션 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  TicketDetail: { ticketId: string };
  TicketQR: { ticketId: string };
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

// 샘플 데이터
export const SAMPLE_TICKETS: Ticket[] = [
  {
    id: "1",
    title: "BTS 월드투어 2023",
    date: "2023년 12월 15일 19:30",
    location: "서울 올림픽 주경기장",
    seat: "스탠딩 A구역 12번",
    issuer: "Ticketmaster Korea",
    status: "active",
    type: "concert",
  },
  {
    id: "2",
    title: "어벤져스: 시크릿 워즈",
    date: "2023년 11월 5일 14:20",
    location: "메가박스 코엑스",
    seat: "I열 7번",
    issuer: "CGV",
    status: "used",
    type: "movie",
  },
  {
    id: "3",
    title: "손흥민 자선 축구경기",
    date: "2023년 12월 22일 16:00",
    location: "서울월드컵경기장",
    seat: "동측 2층 24구역 5열 12번",
    issuer: "대한축구협회",
    status: "active",
    type: "sports",
  },
  {
    id: "4",
    title: "반 고흐 전시회",
    date: "2023년 10월 10일 13:00",
    location: "국립현대미술관",
    seat: "일반 입장권",
    issuer: "국립현대미술관",
    status: "expired",
    type: "exhibition",
  },
  {
    id: "5",
    title: "뮤지컬 라이온 킹",
    date: "2024년 1월 7일 19:00",
    location: "샤롯데 씨어터",
    seat: "R석 1층 C열 15번",
    issuer: "인터파크 티켓",
    status: "active",
    type: "concert",
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string }>({ name: "사용자" }); // 임시 사용자 정보
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");

  // 티켓 데이터 로드 및 VC 상태 확인
  useEffect(() => {
    const loadTicketsAndVCStatus = async () => {
      try {
        setIsLoading(true);

        // 실제 구현에서는 API 호출로 티켓 목록 가져오기
        // 여기서는 샘플 데이터 사용

        // AsyncStorage에서 VC 목록 가져오기
        const vcs = await getVCs();
        console.log("저장된 VC 개수:", vcs.length);

        setTickets(SAMPLE_TICKETS);
        setIsLoading(false);
      } catch (error) {
        console.error("티켓 로딩 오류:", error);
        setIsLoading(false);
      }
    };

    loadTicketsAndVCStatus();
  }, [refreshKey]);

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      // AsyncStorage에서 VC 목록 가져오기
      const vcs = await getVCs();
      console.log("새로고침 - 저장된 VC 개수:", vcs.length);

      // 실제 구현에서는 API 재호출
      setTickets([...SAMPLE_TICKETS]);
      setRefreshing(false);
    } catch (error) {
      console.error("새로고침 오류:", error);
      setRefreshing(false);
    }
  };

  // 티켓 선택 처리
  const handleTicketPress = (ticket: Ticket) => {
    // 티켓 상세 페이지로 이동
    navigation.navigate("TicketDetail", { ticketId: ticket.id });
  };

  const handleLogout = async () => {
    // 로그아웃 처리
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  // VC 상태 변경 시 화면 갱신
  const handleVCUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>DID Wallet</ThemedText>
          {user && <ThemedText style={styles.welcomeText}>안녕하세요, {user.name}님!</ThemedText>}
          <ThemedText style={styles.subtitle}>내 예매 티켓</ThemedText>
        </View>

        <View style={styles.content}>
          <TicketList
            tickets={tickets}
            isLoading={isLoading}
            onTicketPress={handleTicketPress}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </View>

        {/* VC 디버그 패널 */}
        <VCDebugPanel onUpdate={handleVCUpdate} />

        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.footer}>
            <AuthButton title="로그아웃" onPress={handleLogout} isPrimary={false} />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: "transparent",
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "android" ? 50 : 16,
  },
});
