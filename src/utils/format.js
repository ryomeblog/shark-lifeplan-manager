/**
 * 金額のフォーマット
 * @param {number} amount - フォーマットする金額
 * @param {boolean} showUnit - 単位（円）を表示するかどうか
 * @returns {string} フォーマットされた金額
 */
export const formatCurrency = (amount, showUnit = true) => {
  const formatted = Math.round(amount).toLocaleString("ja-JP");
  return showUnit ? `${formatted}円` : formatted;
};

/**
 * パーセンテージのフォーマット
 * @param {number} value - フォーマットする値（0.1 = 10%）
 * @param {number} decimals - 小数点以下の桁数
 * @returns {string} フォーマットされたパーセンテージ
 */
export const formatPercentage = (value, decimals = 1) => {
  const percentage = (value * 100).toFixed(decimals);
  return `${percentage}%`;
};

/**
 * 日付のフォーマット
 * @param {string|Date} date - フォーマットする日付
 * @param {string} format - 日付フォーマット（'short'|'medium'|'long'）
 * @returns {string} フォーマットされた日付
 */
export const formatDate = (date, format = "medium") => {
  const d = new Date(date);

  switch (format) {
    case "short":
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    case "long":
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });

    case "medium":
    default:
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  }
};

/**
 * 年齢の計算
 * @param {string|Date} birthDate - 生年月日
 * @param {string|Date} baseDate - 基準日（省略時は現在日付）
 * @returns {number} 年齢
 */
export const calculateAge = (birthDate, baseDate = new Date()) => {
  const birth = new Date(birthDate);
  const base = new Date(baseDate);

  let age = base.getFullYear() - birth.getFullYear();
  const monthDiff = base.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && base.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * 期間の計算（年数）
 * @param {string|Date} startDate - 開始日
 * @param {string|Date} endDate - 終了日
 * @returns {number} 年数（小数点以下あり）
 */
export const calculateYearsBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return diffTime / (1000 * 60 * 60 * 24 * 365.25);
};

/**
 * 文字列の省略
 * @param {string} text - 元の文字列
 * @param {number} maxLength - 最大長
 * @returns {string} 省略された文字列
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

/**
 * カラーコードの明度調整
 * @param {string} color - カラーコード（#RRGGBB形式）
 * @param {number} amount - 調整量（-1.0～1.0）
 * @returns {string} 調整後のカラーコード
 */
export const adjustColorBrightness = (color, amount) => {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount * 255;
  let g = ((num >> 8) & 0x00ff) + amount * 255;
  let b = (num & 0x0000ff) + amount * 255;

  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * 数値の範囲内への制限
 * @param {number} value - 制限する値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} 制限された値
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};
