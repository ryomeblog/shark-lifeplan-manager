import React from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { COLORS, THEME } from "../../constants";

/**
 * 確認ダイアログコンポーネント
 *
 * @param {object} props
 * @param {boolean} props.visible - ダイアログの表示状態
 * @param {function} props.onDismiss - キャンセル時のコールバック
 * @param {function} props.onConfirm - 確認時のコールバック
 * @param {string} props.title - ダイアログのタイトル
 * @param {string} props.message - 確認メッセージ
 * @param {string} props.confirmLabel - 確認ボタンのラベル
 * @param {string} props.cancelLabel - キャンセルボタンのラベル
 * @param {string} props.confirmColor - 確認ボタンの色
 */
const ConfirmDialog = ({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  confirmColor = COLORS.accent.error,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {/* ダイアログタイトル */}
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>

        {/* メッセージ本文 */}
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>

        {/* アクションボタン */}
        <Dialog.Actions style={styles.actions}>
          {/* キャンセルボタン */}
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            {cancelLabel}
          </Button>

          {/* 確認ボタン */}
          <Button
            mode="contained"
            onPress={onConfirm}
            style={[styles.button, { backgroundColor: confirmColor }]}
            labelStyle={styles.confirmLabel}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: COLORS.common.white,
    borderRadius: THEME.borderRadius.md,
  },
  title: {
    fontSize: THEME.typography.h4,
    marginBottom: THEME.spacing.sm,
  },
  message: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[700],
    lineHeight: 24,
  },
  actions: {
    marginTop: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
  },
  button: {
    minWidth: 100,
    marginLeft: THEME.spacing.sm,
  },
  confirmLabel: {
    color: COLORS.common.white,
  },
});

export default ConfirmDialog;
