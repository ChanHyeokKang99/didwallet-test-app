import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AuthButton } from "../components/AuthButton";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { useThemeColor } from "../hooks/useThemeColor";

// 샘플 데이터에서 티켓 찾기 (실제로는 API 호출)
import { RootStackParamList, SAMPLE_TICKETS, Ticket } from "./HomeScreen";

// QR 생성 단계
enum QRStep {
  SCAN_VENUE_QR = "scan_venue_qr", // 장소 QR 스캔
  GENERATE_ENTRY_QR = "generate_entry_qr", // 입장 QR 생성
}

type TicketQRScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TicketQR">;
  route: RouteProp<RootStackParamList, "TicketQR">;
};

interface VenueData {
  type: string;
  venueId: string;
}

interface VPData {
  type: string;
  ticketId: string;
  venueId: string;
  timestamp: string;
  nonce: string;
}

export default function TicketQRScreen({ route, navigation }: TicketQRScreenProps) {
  const { ticketId } = route.params || {};
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [step, setStep] = useState<QRStep>(QRStep.SCAN_VENUE_QR);
  const [venueCode, setVenueCode] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3분(180초) 유효시간
  const [scanned, setScanned] = useState<boolean>(false);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");
  const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");

  // 화면 크기
  const { width } = Dimensions.get("window");
  const qrSize = width * 0.7;

  // 티켓 데이터 로드
  useEffect(() => {
    const loadTicket = async () => {
      try {
        // 실제로는 API 호출
        setTimeout(() => {
          const foundTicket = SAMPLE_TICKETS.find((t) => t.id === ticketId);
          if (foundTicket) {
            setTicket(foundTicket);
          }
          setLoading(false);
        }, 500);
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

  // 카메라 권한 요청
  useEffect(() => {
    // 실제 앱에서는 카메라 권한을 요청하는 코드가 필요합니다
    // 현재는 개발 환경에서 테스트를 위해 항상 true로 설정
    setHasPermission(true);
  }, []);

  // QR 생성 후 타이머 시작
  useEffect(() => {
    if (step === QRStep.GENERATE_ENTRY_QR && qrData) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 타이머 클린업
      return () => clearInterval(timer);
    }
  }, [step, qrData]);

  // QR 코드 펄스 애니메이션
  useEffect(() => {
    if (step === QRStep.GENERATE_ENTRY_QR && qrData) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 페이드인 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [step, qrData]);

  // QR 코드 스캔 처리
  const handleBarCodeScanned = (data: string) => {
    // 이미 스캔된 경우 무시
    if (scanned || venueCode) return;

    setScanned(true);

    try {
      // 실제로는 서버에서 검증 필요
      const venueData: VenueData = JSON.parse(data);

      if (venueData.type === "venue" && venueData.venueId) {
        setVenueCode(venueData.venueId);

        // VP 생성 (실제로는 VC + 난수를 결합하여 VP 생성)
        setTimeout(() => {
          generateEntryQR(venueData.venueId);
        }, 1000);
      } else {
        Alert.alert("오류", "유효하지 않은 QR 코드입니다. 다시 시도해주세요.", [
          { text: "확인", onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      Alert.alert("오류", "QR 코드를 읽는 중 오류가 발생했습니다. 다시 시도해주세요.", [
        { text: "확인", onPress: () => setScanned(false) },
      ]);
    }
  };

  // 입장 QR 생성
  const generateEntryQR = (venueId: string) => {
    if (!ticket) return;

    // 실제로는 서버에서 VP 생성
    const vpData: VPData = {
      type: "vp",
      ticketId: ticket.id,
      venueId: venueId,
      timestamp: new Date().toISOString(),
      nonce: Math.random().toString(36).substring(2, 15),
      // 실제로는 DID 서명 포함
    };

    setQrData(JSON.stringify(vpData));
    setStep(QRStep.GENERATE_ENTRY_QR);
  };

  // 테스트용 QR 생성 (실제 구현에서는 제거)
  const handleTestGenerateQR = () => {
    if (!ticket) return;

    const testVenueId = "venue_" + Math.random().toString(36).substring(2, 9);
    setVenueCode(testVenueId);
    generateEntryQR(testVenueId);
  };

  // 타이머 포맷팅 (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
            <ThemedText style={styles.headerTitle}>입장 QR</ThemedText>
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

  if (hasPermission === false && step === QRStep.SCAN_VENUE_QR) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>입장 QR</ThemedText>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.notFoundContainer}>
            <ThemedText style={styles.notFoundText}>카메라 접근 권한이 필요합니다.</ThemedText>
            <AuthButton title="돌아가기" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {step === QRStep.SCAN_VENUE_QR ? "장소 QR 스캔" : "입장 QR 코드"}
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {step === QRStep.SCAN_VENUE_QR ? (
            <>
              <View style={styles.scannerContainer}>
                <ThemedText style={styles.scanTitle}>입장 게이트의 QR 코드를 스캔해주세요</ThemedText>
                <View style={styles.scanner}>
                  {/* 실제 앱에서는 QR 스캐너 컴포넌트가 여기에 들어갑니다 */}
                  {/* 개발 환경에서는 테스트를 위해 대체 UI를 표시합니다 */}
                  <View style={styles.scannerPlaceholder}>
                    <Text style={styles.scannerPlaceholderText}>카메라 미리보기</Text>
                  </View>
                  <View style={styles.scannerOverlay}>
                    <View style={styles.scannerTarget} />
                  </View>
                </View>
                <ThemedText style={styles.scanDescription}>
                  입장 게이트에 있는 QR 코드를 스캔하면{"\n"}
                  입장용 QR 코드가 생성됩니다.
                </ThemedText>

                {/* 테스트용 버튼 */}
                <SafeAreaView style={styles.bottomSafeArea}>
                  <TouchableOpacity style={styles.testButton} onPress={handleTestGenerateQR}>
                    <ThemedText style={styles.testButtonText}>테스트용: QR 생성하기</ThemedText>
                  </TouchableOpacity>
                </SafeAreaView>
              </View>
            </>
          ) : (
            <View style={styles.qrContainer}>
              <ThemedText style={styles.qrTitle}>{ticket.title}</ThemedText>

              <Animated.View
                style={[
                  styles.qrWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {qrData && <QRCode value={qrData} size={qrSize} color="#000000" backgroundColor="#FFFFFF" />}
              </Animated.View>

              <View style={styles.timerContainer}>
                <ThemedText style={styles.timerLabel}>유효 시간</ThemedText>
                <ThemedText style={[styles.timer, timeLeft < 30 && styles.timerWarning]}>
                  {formatTime(timeLeft)}
                </ThemedText>
              </View>

              <View style={styles.infoContainer}>
                <ThemedText style={styles.infoText}>
                  • 이 QR 코드는 {formatTime(timeLeft)} 동안 유효합니다.{"\n"}• 입장 시 게이트 담당자에게 보여주세요.
                  {"\n"}• 시간이 만료되면 다시 생성해야 합니다.
                </ThemedText>
              </View>

              {timeLeft === 0 && (
                <SafeAreaView style={styles.bottomSafeArea}>
                  <View style={styles.expiredContainer}>
                    <ThemedText style={styles.expiredText}>QR 코드가 만료되었습니다.</ThemedText>
                    <AuthButton
                      title="다시 스캔하기"
                      onPress={() => {
                        setStep(QRStep.SCAN_VENUE_QR);
                        setVenueCode(null);
                        setQrData(null);
                        setTimeLeft(180);
                        setScanned(false);
                      }}
                    />
                  </View>
                </SafeAreaView>
              )}
            </View>
          )}
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  scannerContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  scanner: {
    width: 280,
    height: 280,
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 24,
    position: "relative",
  },
  scannerPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerPlaceholderText: {
    color: "#fff",
    fontSize: 16,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTarget: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 16,
  },
  scanDescription: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 24,
  },
  bottomSafeArea: {
    backgroundColor: "transparent",
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(46, 91, 255, 0.1)",
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 24 : 0,
  },
  testButtonText: {
    color: "#2E5BFF",
    fontWeight: "600",
  },
  qrContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  timer: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  timerWarning: {
    color: "#E53935",
  },
  infoContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expiredContainer: {
    marginTop: 24,
    alignItems: "center",
    marginBottom: Platform.OS === "android" ? 24 : 0,
  },
  expiredText: {
    fontSize: 16,
    color: "#E53935",
    marginBottom: 16,
  },
});
