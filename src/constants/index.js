import { Dimensions, Platform } from "react-native";

/**
 * 画面サイズのブレークポイント
 */
export const BREAKPOINTS = {
  mobile: 0, // 0-767px
  tablet: 768, // 768-1023px
  desktop: 1024, // 1024px以上
};

/**
 * デバイスの種類判定
 */
export const DEVICE = {
  isWeb: Platform.OS === "web",
  isMobile: Platform.OS === "ios" || Platform.OS === "android",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
};

/**
 * カラーパレット
 */
export const COLORS = {
  // プライマリカラー
  primary: {
    main: "#2196F3",
    light: "#64B5F6",
    dark: "#1976D2",
    contrastText: "#FFFFFF",
  },

  // セカンダリカラー
  secondary: {
    main: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
    contrastText: "#000000",
  },

  // アクセントカラー
  accent: {
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#F44336",
    info: "#2196F3",
  },

  // グレースケール
  grey: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // 共通カラー
  common: {
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
  },

  // 機能別カラー
  functional: {
    divider: "rgba(0, 0, 0, 0.12)",
    overlay: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(0, 0, 0, 0.2)",
    backdrop: "rgba(0, 0, 0, 0.5)",
  },
};

/**
 * テーマ設定
 */
export const THEME = {
  // スペーシング
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // フォントサイズ
  typography: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    body1: 16,
    body2: 14,
    caption: 12,
  },

  // 角丸
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // シャドウ
  shadows: Platform.select({
    ios: {
      sm: {
        shadowColor: COLORS.common.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      md: {
        shadowColor: COLORS.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      lg: {
        shadowColor: COLORS.common.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    },
    android: {
      sm: { elevation: 2 },
      md: { elevation: 4 },
      lg: { elevation: 8 },
    },
    web: {
      sm: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      },
      md: {
        boxShadow: "0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)",
      },
      lg: {
        boxShadow: "0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)",
      },
    },
  }),
};

/**
 * アプリケーション設定
 */
export const APP_CONFIG = {
  // ストレージキー
  storageKeys: {
    appData: "appData",
    theme: "theme",
    settings: "settings",
  },

  // APIタイムアウト
  timeouts: {
    default: 10000, // 10秒
    long: 30000, // 30秒
  },

  // 通知表示時間
  notificationDuration: {
    short: 2000, // 2秒
    normal: 4000, // 4秒
    long: 8000, // 8秒
  },
};

/**
 * 列挙型定数
 */
export const ENUMS = {
  // 頻度
  frequency: {
    ONCE: "once",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    YEARLY: "yearly",
  },

  // 複利計算頻度
  compoundingFrequency: {
    DAILY: "daily",
    MONTHLY: "monthly",
    YEARLY: "yearly",
  },

  // 関係性
  relationship: {
    SELF: "本人",
    SPOUSE: "配偶者",
    CHILD: "子",
    PARENT: "親",
    OTHER: "その他",
  },
};

/**
 * バリデーション定数
 */
export const VALIDATION = {
  // 最大文字数
  maxLength: {
    name: 100,
    description: 1000,
    note: 500,
  },

  // 数値範囲
  range: {
    year: {
      min: 1900,
      max: 2100,
    },
    amount: {
      min: 0,
      max: 999999999999, // 1兆円未満
    },
    percentage: {
      min: 0,
      max: 1,
    },
    age: {
      min: 0,
      max: 120,
    },
  },
};

/**
 * アニメーション設定
 */
export const ANIMATION = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: "ease-in-out",
    easeOut: "ease-out",
    easeIn: "ease-in",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};
