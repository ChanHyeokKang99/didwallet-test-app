import { AuthButton } from "@/components/AuthButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ticket } from "@/components/TicketCard";
import { TicketList } from "@/components/TicketList";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/utils/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";

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

export default function HomeScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");

  // 티켓 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    const loadTickets = async () => {
      try {
        // 실제 구현에서는 API 호출로 대체
        setTimeout(() => {
          setTickets(SAMPLE_TICKETS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("티켓 로딩 오류:", error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    // 실제 구현에서는 API 재호출
    setTimeout(() => {
      setTickets(SAMPLE_TICKETS);
      setRefreshing(false);
    }, 1000);
  };

  // 티켓 선택 처리
  const handleTicketPress = (ticket: Ticket) => {
    // 티켓 상세 페이지로 이동
    router.push({
      pathname: "/(app)/ticket-detail",
      params: { id: ticket.id },
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 후 로그인 페이지로 이동
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
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

        <View style={styles.footer}>
          <AuthButton title="로그아웃" onPress={handleLogout} isPrimary={false} />
        </View>
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
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
});
