import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ticket } from "../components/TicketCard";

// VC 관련 스토리지 키
const VC_STORAGE_KEY = "did_wallet_vcs";

// VC 타입 정의
export interface VerifiableCredential {
  id: string;
  ticketId: string;
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  status: "valid" | "revoked" | "expired";
  credentialSubject: {
    id: string;
    ticketInfo: {
      title: string;
      date: string;
      location: string;
      seat: string;
      type: string;
    };
  };
}

/**
 * 티켓으로부터 VC 생성 (실제로는 서버에서 발급)
 */
export const createVC = (ticket: Ticket, userId: string): VerifiableCredential => {
  return {
    id: `vc-${ticket.id}-${Date.now()}`,
    ticketId: ticket.id,
    issuer: ticket.issuer,
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
    status: "valid",
    credentialSubject: {
      id: userId,
      ticketInfo: {
        title: ticket.title,
        date: ticket.date,
        location: ticket.location,
        seat: ticket.seat,
        type: ticket.type,
      },
    },
  };
};

/**
 * VC 저장
 */
export const saveVC = async (vc: VerifiableCredential): Promise<boolean> => {
  try {
    // 기존 VC 목록 가져오기
    const existingVCs = await getVCs();

    // 이미 존재하는지 확인
    const exists = existingVCs.some((existingVC) => existingVC.id === vc.id);
    if (exists) {
      // 이미 존재하면 업데이트
      const updatedVCs = existingVCs.map((existingVC) => (existingVC.id === vc.id ? vc : existingVC));
      await AsyncStorage.setItem(VC_STORAGE_KEY, JSON.stringify(updatedVCs));
    } else {
      // 새로 추가
      existingVCs.push(vc);
      await AsyncStorage.setItem(VC_STORAGE_KEY, JSON.stringify(existingVCs));
    }
    return true;
  } catch (error) {
    console.error("VC 저장 오류:", error);
    return false;
  }
};

/**
 * 모든 VC 가져오기
 */
export const getVCs = async (): Promise<VerifiableCredential[]> => {
  try {
    const vcsString = await AsyncStorage.getItem(VC_STORAGE_KEY);
    if (!vcsString) return [];
    return JSON.parse(vcsString);
  } catch (error) {
    console.error("VC 로드 오류:", error);
    return [];
  }
};

/**
 * 특정 티켓 ID에 해당하는 VC 가져오기
 */
export const getVCByTicketId = async (ticketId: string): Promise<VerifiableCredential | null> => {
  try {
    const vcs = await getVCs();
    return vcs.find((vc) => vc.ticketId === ticketId) || null;
  } catch (error) {
    console.error("VC 조회 오류:", error);
    return null;
  }
};

/**
 * VC 삭제
 */
export const deleteVC = async (vcId: string): Promise<boolean> => {
  try {
    const vcs = await getVCs();
    const updatedVCs = vcs.filter((vc) => vc.id !== vcId);
    await AsyncStorage.setItem(VC_STORAGE_KEY, JSON.stringify(updatedVCs));
    return true;
  } catch (error) {
    console.error("VC 삭제 오류:", error);
    return false;
  }
};

/**
 * 티켓 ID로 VC 존재 여부 확인
 */
export const hasVCForTicket = async (ticketId: string): Promise<boolean> => {
  const vc = await getVCByTicketId(ticketId);
  return vc !== null;
};

/**
 * 스토리지 초기화 (테스트용)
 */
export const clearVCStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(VC_STORAGE_KEY);
  } catch (error) {
    console.error("VC 스토리지 초기화 오류:", error);
  }
};
