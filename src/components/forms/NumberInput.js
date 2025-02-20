import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, TextInput } from "react-native-paper";
import { COLORS, THEME } from "../../constants";
import { formatCurrency, formatPercentage } from "../../utils/format";

/**
 * 数値入力コンポーネント
 */
const NumberInput = ({
  label,
  value,
  onChangeValue,
  error,
  style,
  min,
  max,
  step = 1,
  format,
  showStepper = true,
  disabled = false,
}) => {
  /**
   * 表示値のフォーマット
   */
  const formatValue = (val) => {
    if (val === null || val === undefined) return "";

    switch (format) {
      case "currency":
        return formatCurrency(val, false);
      case "percent":
        return formatPercentage(val);
      default:
        return String(val);
    }
  };

  /**
   * 入力値のパース
   */
  const parseValue = (text) => {
    const sanitized = text.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? null : parsed;
  };

  /**
   * 値の増減
   */
  const adjustValue = (amount) => {
    const newValue = (value || 0) + amount;
    if (min !== undefined && newValue < min) return;
    if (max !== undefined && newValue > max) return;
    onChangeValue(newValue);
  };

  /**
   * テキスト入力時の処理
   */
  const handleChangeText = (text) => {
    const newValue = parseValue(text);
    if (newValue === null) {
      onChangeValue(null);
      return;
    }

    if (min !== undefined && newValue < min) return;
    if (max !== undefined && newValue > max) return;
    onChangeValue(newValue);
  };

  return (
    <View style={[styles.container, style]}>
      {/* 数値入力フィールド */}
      <View style={styles.inputContainer}>
        <TextInput
          label={label}
          defaultValue={formatValue(value)}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          error={!!error}
          disabled={disabled}
          style={styles.input}
        />
      </View>

      {/* ステッパーボタン */}
      {showStepper && (
        <View style={styles.stepperContainer}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => adjustValue(-step)}
            disabled={disabled || (min !== undefined && (value || 0) <= min)}
            style={styles.stepperButton}
          />
          <IconButton
            icon="plus"
            size={20}
            onPress={() => adjustValue(step)}
            disabled={disabled || (max !== undefined && (value || 0) >= max)}
            style={styles.stepperButton}
          />
        </View>
      )}

      {/* エラーメッセージ */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.common.white,
  },
  stepperContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 0,
    top: 8,
  },
  stepperButton: {
    margin: 0,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
});

export default NumberInput;
