import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { hasVCForTicket } from "../services/VCService";
import { RequestVCButton } from "./RequestVCButton";
import { ThemedText } from "./ThemedText";

export interface Ticket {
  id: string;
  title: string;
  date: string;
  location: string;
  seat: string;
  issuer: string;
  status: "active" | "used" | "expired";
  type: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onPress?: (ticket: Ticket) => void;
  onVCStatusChange?: () => void;
}

export function TicketCard({ ticket, onPress, onVCStatusChange }: TicketCardProps) {
  const [hasVC, setHasVC] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const cardBgColor = useThemeColor({ light: "#FFFFFF", dark: "#1E2022" }, "background");
  const borderColor = useThemeColor({ light: "#E5E9F0", dark: "#2C3235" }, "text");
  const vcStatusColor = hasVC
    ? { bgColor: "#E1F5E9", textColor: "#0C6B39" }
    : { bgColor: "#FEF3C7", textColor: "#B45309" };

  // VC 상태 확인
  useEffect(() => {
    const checkVCStatus = async () => {
      try {
        setIsLoading(true);
        const exists = await hasVCForTicket(ticket.id);
        setHasVC(exists);
      } catch (error) {
        console.error("VC 상태 확인 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVCStatus();
  }, [ticket.id]);

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

  const statusColors = getStatusColor(ticket.status);

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

  const typeColor = getTypeColor(ticket.type);

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

  // VC 발급 성공 처리
  const handleVCSuccess = async () => {
    setHasVC(true);
    if (onVCStatusChange) {
      onVCStatusChange();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => onPress && onPress(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.typeTag, { backgroundColor: `${typeColor}20` }]}>
          <ThemedText style={[styles.typeText, { color: typeColor }]}>{ticket.type}</ThemedText>
        </View>
        <View style={[styles.statusTag, { backgroundColor: statusColors.bgColor }]}>
          <ThemedText style={[styles.statusText, { color: statusColors.textColor }]}>
            {getStatusText(ticket.status)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>{ticket.title}</ThemedText>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>날짜</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.date}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>장소</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.location}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>좌석</ThemedText>
          <ThemedText style={styles.infoValue}>{ticket.seat}</ThemedText>
        </View>
      </View>

      {/* VC 상태 표시 */}
      <View style={styles.vcContainer}>
        {!isLoading && hasVC !== null && (
          <>
            <View style={[styles.vcStatusTag, { backgroundColor: vcStatusColor.bgColor }]}>
              <ThemedText style={[styles.vcStatusText, { color: vcStatusColor.textColor }]}>
                {hasVC ? "VC 발급됨" : "VC 미발급"}
              </ThemedText>
            </View>

            {!hasVC && ticket.status === "active" && <RequestVCButton ticket={ticket} onSuccess={handleVCSuccess} />}
          </>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <ThemedText style={styles.issuer}>발급처: {ticket.issuer}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  vcContainer: {
    marginBottom: 12,
  },
  vcStatusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  vcStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  issuer: {
    fontSize: 12,
    opacity: 0.6,
  },
});
