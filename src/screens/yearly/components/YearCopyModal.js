import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, RadioButton, Text } from "react-native-paper";
import { COLORS, THEME } from "../../../constants";

/**
 * 年別データコピーモーダル
 *
 * @param {object} props
 * @param {boolean} props.visible - モーダルの表示状態
 * @param {function} props.onDismiss - キャンセル時のコールバック
 * @param {function} props.onSubmit - 確認時のコールバック
 * @param {number} props.currentYear - コピー元の年
 * @param {Array} props.yearlyFinances - 年別財務データの配列
 */
const YearCopyModal = ({
  visible,
  onDismiss,
  onSubmit,
  currentYear,
  yearlyFinances,
}) => {
  const [selectedYear, setSelectedYear] = useState(null);

  /**
   * コピー実行
   */
  const handleSubmit = () => {
    if (selectedYear) {
      onSubmit(selectedYear);
      setSelectedYear(null);
    }
  };

  /**
   * モーダルを閉じる
   */
  const handleDismiss = () => {
    setSelectedYear(null);
    onDismiss();
  };

  // コピー元の年を除外した選択可能な年のリスト
  const availableYears = yearlyFinances
    .filter((yf) => yf.year !== currentYear)
    .sort((a, b) => a.year - b.year);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>年別データのコピー</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            {currentYear}年のデータをコピーする年を選択してください
          </Text>

          <RadioButton.Group
            onValueChange={(value) => setSelectedYear(value)}
            value={selectedYear}
          >
            {availableYears.map((yearData) => (
              <View key={yearData.id} style={styles.radioItem}>
                <RadioButton.Item
                  label={`${yearData.year}年`}
                  value={yearData.year}
                  position="leading"
                  labelStyle={styles.radioLabel}
                />
              </View>
            ))}
          </RadioButton.Group>

          {availableYears.length === 0 && (
            <Text style={styles.emptyText}>
              コピー先として選択可能な年がありません
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.footerButton}
          >
            キャンセル
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!selectedYear || availableYears.length === 0}
            style={styles.footerButton}
          >
            コピー
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: COLORS.common.white,
    margin: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    maxHeight: "90%",
  },
  header: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: THEME.typography.h3,
    fontWeight: "bold",
  },
  content: {
    padding: THEME.spacing.md,
  },
  description: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[700],
    marginBottom: THEME.spacing.md,
  },
  radioItem: {
    marginVertical: THEME.spacing.xs,
  },
  radioLabel: {
    fontSize: THEME.typography.body1,
  },
  emptyText: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
    textAlign: "center",
    marginTop: THEME.spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  footerButton: {
    marginLeft: THEME.spacing.sm,
    minWidth: 100,
  },
});

export default YearCopyModal;
