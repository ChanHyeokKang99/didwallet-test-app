import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { clearVCStorage, getVCs, VerifiableCredential } from "../services/VCService";
import { ThemedText } from "./ThemedText";

interface VCDebugPanelProps {
  onUpdate?: () => void;
}

export function VCDebugPanel({ onUpdate }: VCDebugPanelProps) {
  const [vcs, setVcs] = useState<VerifiableCredential[]>([]);
  const [expanded, setExpanded] = useState(false);
  const backgroundColor = useThemeColor({ light: "#F5F7FA", dark: "#1A1D1E" }, "background");
  const borderColor = useThemeColor({ light: "#E5E9F0", dark: "#2C3235" }, "text");
  const textColor = useThemeColor({ light: "#1A1D1E", dark: "#F5F7FA" }, "text");

  const loadVCs = async () => {
    const storedVCs = await getVCs();
    setVcs(storedVCs);
  };

  useEffect(() => {
    loadVCs();
  }, []);

  const handleClearStorage = async () => {
    await clearVCStorage();
    await loadVCs();
    if (onUpdate) onUpdate();
  };

  const handleRefresh = async () => {
    await loadVCs();
  };

  if (!expanded) {
    return (
      <TouchableOpacity
        style={[styles.collapsedContainer, { backgroundColor, borderColor }]}
        onPress={() => setExpanded(true)}
      >
        <ThemedText style={styles.debugTitle}>VC 디버그 패널 (저장된 VC: {vcs.length})</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={styles.debugTitle}>VC 디버그 패널</ThemedText>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <ThemedText style={styles.closeButton}>닫기</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#2E5BFF" }]} onPress={handleRefresh}>
          <ThemedText style={styles.buttonText}>새로고침</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#E53E3E" }]} onPress={handleClearStorage}>
          <ThemedText style={styles.buttonText}>저장소 초기화</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.vcList}>
        <ThemedText style={styles.vcCount}>저장된 VC: {vcs.length}개</ThemedText>

        {vcs.length === 0 ? (
          <ThemedText style={styles.emptyText}>저장된 VC가 없습니다</ThemedText>
        ) : (
          vcs.map((vc, index) => (
            <View key={vc.id} style={[styles.vcItem, { borderColor }]}>
              <ThemedText style={styles.vcTitle}>
                {index + 1}. {vc.credentialSubject.ticketInfo.title}
              </ThemedText>
              <ThemedText style={styles.vcDetail}>ID: {vc.id}</ThemedText>
              <ThemedText style={styles.vcDetail}>티켓 ID: {vc.ticketId}</ThemedText>
              <ThemedText style={styles.vcDetail}>발급자: {vc.issuer}</ThemedText>
              <ThemedText style={styles.vcDetail}>발급일: {new Date(vc.issuanceDate).toLocaleString()}</ThemedText>
              <ThemedText style={styles.vcDetail}>상태: {vc.status || "valid"}</ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 400,
  },
  collapsedContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  debugTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    color: "#2E5BFF",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  vcList: {
    flex: 1,
  },
  vcCount: {
    fontWeight: "600",
    marginBottom: 10,
  },
  emptyText: {
    fontStyle: "italic",
    opacity: 0.7,
    textAlign: "center",
    marginTop: 20,
  },
  vcItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  vcTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 5,
  },
  vcDetail: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
});
