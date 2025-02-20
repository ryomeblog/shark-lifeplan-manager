import { useDeviceOrientation } from "@react-native-community/hooks";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "react-native-get-random-values";
import {
  Button,
  DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { COLORS, THEME } from "./src/constants";
import { rootStore } from "./src/stores/RootStore";

// スクリーンのインポート
import DetailScreen from "./src/screens/detail/DetailScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import YearlyListScreen from "./src/screens/yearly/YearlyListScreen";

const Stack = createNativeStackNavigator();

/**
 * アプリケーションのメインコンポーネント
 */
const App = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const orientation = useDeviceOrientation();

  // アプリケーションの初期化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // ストアの初期化
        await rootStore.initialize();
        setIsLoading(false);
      } catch (error) {
        console.error("アプリケーションの初期化に失敗しました:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // ローディング画面
  if (isLoading) {
    return (
      <PaperProvider>
        <LoadingScreen />
      </PaperProvider>
    );
  }

  // エラー画面
  if (isError) {
    return (
      <PaperProvider>
        <ErrorScreen
          message="アプリケーションの起動に失敗しました"
          onRetry={() => window.location.reload()}
        />
      </PaperProvider>
    );
  }

  // React Native Paperのテーマ設定
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary.main,
      accent: COLORS.secondary.main,
      background: COLORS.common.white,
      surface: COLORS.common.white,
      text: COLORS.grey[900],
      error: COLORS.accent.error,
    },
    // カスタムテーマの設定
    spacing: THEME.spacing,
    borderRadius: THEME.borderRadius,
    typography: THEME.typography,
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        backgroundColor={COLORS.primary.dark}
        barStyle="light-content"
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary.main,
            },
            headerTintColor: COLORS.common.white,
            headerTitleStyle: {
              fontSize: THEME.typography.h4,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "ライフプラン一覧",
            }}
          />
          <Stack.Screen
            name="YearlyList"
            component={YearlyListScreen}
            options={{
              title: "年別収支一覧",
            }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              title: "収支イベント資産管理",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
});

/**
 * ローディング画面コンポーネント
 */
const LoadingScreen = () => {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary.main} />
      <Text style={styles.loadingText}>読み込み中...</Text>
    </View>
  );
};

/**
 * エラー画面コンポーネント
 */
const ErrorScreen = ({ message, onRetry }) => {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <Button mode="contained" onPress={onRetry}>
        再試行
      </Button>
    </View>
  );
};

/**
 * スタイル定義
 */
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.common.white,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
  },
  errorText: {
    marginBottom: THEME.spacing.md,
    fontSize: THEME.typography.body1,
    color: COLORS.accent.error,
  },
});

export default App;
