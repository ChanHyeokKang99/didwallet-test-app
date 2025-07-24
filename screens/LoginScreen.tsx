import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  useFocusEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        navigation.replace("Home");
      }
    });
  });

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
      return 30;
    } else if (height <= 812) {
      // iPhone X, 11 Pro, 12 mini 등 중간 화면
      return 50;
    } else {
      // iPhone 11, 12, 13 Pro Max 등 큰 화면
      return 60;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 4) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // const res = await restful("POST", "/auth/login", { email, password });
      setIsLoading(false);
      // await AsyncStorage.setItem("token", res.data.access.token);
      navigation.replace("Home");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
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
                <ThemedText style={styles.title}>로그인</ThemedText>
                <ThemedText style={styles.subtitle}>표켓몬Wallet에 오신 것을 환영합니다</ThemedText>
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

                <TouchableOpacity style={styles.forgotPassword}>
                  <ThemedText style={{ color: tintColor }}>비밀번호를 잊으셨나요?</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.actions}>
                <AuthButton title="로그인" onPress={handleLogin} isLoading={isLoading} />

                <View style={styles.signupContainer}>
                  <ThemedText style={styles.signupText}>계정이 없으신가요?</ThemedText>
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <ThemedText style={[styles.signupLink, { color: tintColor }]}>회원가입</ThemedText>
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
    justifyContent: "center",
  },
  header: {
    marginBottom: Platform.OS === "ios" ? 24 : 32,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 16,
    padding: 4,
  },
  actions: {
    marginTop: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  signupText: {
    marginRight: 4,
  },
  signupLink: {
    fontWeight: "600",
    padding: 4,
  },
});
