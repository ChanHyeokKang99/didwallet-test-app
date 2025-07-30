import restful from "@/services/Restful";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { useThemeColor } from "../hooks/useThemeColor";
import { RootStackParamList } from "./HomeScreen";

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Signup">;
};

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    deviceId?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const tintColor = useThemeColor({ light: "#2E5BFF", dark: "#2E5BFF" }, "tint");
  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");

  // 화면 크기 가져오기
  const { height } = Dimensions.get("window");
  const statusBarHeight = Constants.statusBarHeight || 0;

  // iOS 기기 높이에 따른 패딩 조정
  const getTopPadding = (): number => {
    if (Platform.OS !== "ios") return 40;

    if (height <= 667) {
      // iPhone SE, iPhone 8 등 작은 화면
      return 20;
    } else if (height <= 812) {
      // iPhone X, 11 Pro, 12 mini 등 중간 화면
      return 30;
    } else {
      // iPhone 11, 12, 13 Pro Max 등 큰 화면
      return 40;
    }
  };

  useEffect(() => {
    const getDeviceId = async () => {
      const deviceId = Device.osInternalBuildId || "";
      console.log(deviceId);
      setDeviceId(deviceId);
    };
    getDeviceId();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: {
      deviceId?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 7) {
      newErrors.password = "비밀번호는 최소 7자 이상이어야 합니다";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 실제 회원가입 로직을 여기에 구현
      // 예: await authService.register(email, password, deviceId);
      const res = await restful("POST", "/user/v1/auth/register", { email, password, deviceId });
      console.log(res);
      await SecureStore.setItemAsync("DID_PRIVATE_KEY", res.data.privateKey);
      // 성공 시 메인 화면으로 이동 (임시로 타임아웃 사용)
      setIsLoading(false);
      navigation.replace("Login");
    } catch (error) {
      setIsLoading(false);
      Alert.alert("오류", "회원가입 중 문제가 발생했습니다.");
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? statusBarHeight : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
          >
            <View style={[styles.contentContainer, { paddingTop: getTopPadding() }]}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>회원가입</ThemedText>
                <ThemedText style={styles.subtitle}>DID Wallet 계정을 만들어보세요</ThemedText>
              </View>

              <View style={styles.form}>
                <AuthInput
                  label="이메일"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="이메일을 입력하세요"
                  keyboardType="email-address"
                  error={errors.email}
                />

                <AuthInput
                  label="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호를 입력하세요"
                  secureTextEntry
                  error={errors.password}
                />

                <AuthInput
                  label="비밀번호 확인"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력하세요"
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </View>

              <View style={styles.actions}>
                <AuthButton title="회원가입" onPress={handleSignup} isLoading={isLoading} />

                <View style={styles.loginContainer}>
                  <ThemedText style={styles.loginText}>이미 계정이 있으신가요?</ThemedText>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <ThemedText style={[styles.loginLink, { color: tintColor }]}>로그인</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  header: {
    marginBottom: Platform.OS === "ios" ? 20 : 32,
    paddingTop: 10,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 30 : 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  actions: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  loginText: {
    marginRight: 4,
  },
  loginLink: {
    fontWeight: "600",
    padding: 4,
  },
});
