import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { Ticket, TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: Ticket[];
  isLoading?: boolean;
  onTicketPress?: (ticket: Ticket) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function TicketList({ tickets, isLoading, onTicketPress, onRefresh, refreshing }: TicketListProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0); // 강제 리렌더링을 위한 키
  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#4C7DFF" }, "tint");
  const backgroundColor = useThemeColor({ light: "#F5F7FA", dark: "#151718" }, "background");

  const filterOptions = [
    { label: "전체", value: null },
    { label: "콘서트", value: "concert" },
    { label: "스포츠", value: "sports" },
    { label: "전시회", value: "exhibition" },
    { label: "팬미팅", value: "fanmeeting" },
    { label: "뮤지컬", value: "musical" },
  ];

  const filteredTickets = activeFilter ? tickets.filter((ticket) => ticket.type === activeFilter) : tickets;

  // VC 상태 변경 시 리스트 리렌더링
  const handleVCStatusChange = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>티켓을 불러오는 중...</ThemedText>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor }]}>
        <ThemedText style={styles.emptyText}>예약된 티켓이 없습니다.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container} key={refreshKey}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === item.value && { backgroundColor: tintColor }]}
              onPress={() => setActiveFilter(item.value)}
            >
              <ThemedText style={[styles.filterText, activeFilter === item.value && { color: "#FFFFFF" }]}>
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <TicketCard ticket={item} onPress={onTicketPress} onVCStatusChange={handleVCStatusChange} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing || false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
});
