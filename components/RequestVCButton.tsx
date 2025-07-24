import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { createVC, saveVC } from "../services/VCService";
import { ThemedText } from "./ThemedText";
import { Ticket } from "./TicketCard";

interface RequestVCButtonProps {
  ticket: Ticket;
  onSuccess?: () => void;
}

export function RequestVCButton({ ticket, onSuccess }: RequestVCButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const backgroundColor = useThemeColor({ light: "#2E5BFF", dark: "#4C7DFF" }, "tint");
  const textColor = "#FFFFFF";

  const handleRequestVC = async () => {
    setIsLoading(true);
    try {
      // 실제 구현에서는 API 호출로 VC 발급 요청
      // 여기서는 임시로 setTimeout으로 API 호출 시뮬레이션
      setTimeout(async () => {
        // 임시 VC 데이터 생성 (실제로는 API 응답으로 받음)
        const mockVC = createVC(ticket, "did:example:user123");

        // VC 저장
        await saveVC(mockVC);
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error("VC 발급 요청 오류:", error);
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={handleRequestVC}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <ThemedText style={[styles.buttonText, { color: textColor }]}>VC 발급 요청</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
