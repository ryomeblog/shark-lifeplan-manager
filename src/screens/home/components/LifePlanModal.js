import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";
import NumberInput from "../../../components/forms/NumberInput";
import { COLORS, THEME, VALIDATION } from "../../../constants";
import { validateLifePlan } from "../../../utils/validate";

/**
 * ライフプラン作成・編集モーダル
 */
const LifePlanModal = ({
  visible,
  onDismiss,
  onSubmit,
  title,
  initialValues,
}) => {
  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startYear: new Date().getFullYear(),
    lifespan: 80,
    inflationRate: 0.02,
    members: [],
  });

  // エラー状態
  const [errors, setErrors] = useState({});

  // 初期値のセット
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        startYear: initialValues.startYear || new Date().getFullYear(),
        lifespan: initialValues.lifespan || 80,
        inflationRate: initialValues.inflationRate || 0.02,
      });
    }
  }, [initialValues]);

  /**
   * フォームの検証
   */
  const validateForm = () => {
    try {
      validateLifePlan(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error.field) {
        setErrors({ [error.field]: error.message });
      }
      return false;
    }
  };

  /**
   * 送信処理
   */
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      resetForm();
    }
  };

  /**
   * フォームのリセット
   */
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startYear: new Date().getFullYear(),
      lifespan: 80,
      inflationRate: 0.02,
      members: [],
    });
    setErrors({});
  };

  /**
   * モーダルを閉じる
   */
  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* 名称 */}
          <TextInput
            label="名称"
            defaultValue={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) {
                setErrors({ ...errors, name: null });
              }
            }}
            error={!!errors.name}
            maxLength={VALIDATION.maxLength.name}
            style={styles.input}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* 説明 */}
          <TextInput
            label="説明"
            defaultValue={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={3}
            maxLength={VALIDATION.maxLength.description}
            style={styles.input}
          />

          {/* 開始年 */}
          <NumberInput
            label="開始年"
            defaultValue={formData.startYear}
            onChangeValue={(value) => {
              setFormData({ ...formData, startYear: value });
              if (errors.startYear) {
                setErrors({ ...errors, startYear: null });
              }
            }}
            min={VALIDATION.range.year.min}
            max={VALIDATION.range.year.max}
            error={errors.startYear}
            style={styles.input}
          />

          {/* 想定寿命 */}
          <NumberInput
            label="想定寿命（年）"
            defaultValue={formData.lifespan}
            onChangeValue={(value) => {
              setFormData({ ...formData, lifespan: value });
              if (errors.lifespan) {
                setErrors({ ...errors, lifespan: null });
              }
            }}
            min={1}
            max={100}
            error={errors.lifespan}
            style={styles.input}
          />

          {/* インフレ率 */}
          <NumberInput
            label="年間インフレ率"
            defaultValue={formData.inflationRate}
            onChangeValue={(value) => {
              setFormData({ ...formData, inflationRate: value });
              if (errors.inflationRate) {
                setErrors({ ...errors, inflationRate: null });
              }
            }}
            min={0}
            max={1}
            step={0.001}
            format="percent"
            error={errors.inflationRate}
            style={styles.input}
          />
        </ScrollView>

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
            style={styles.footerButton}
          >
            {initialValues ? "更新" : "作成"}
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
  input: {
    marginBottom: THEME.spacing.sm,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: -THEME.spacing.xs,
    marginBottom: THEME.spacing.sm,
    marginLeft: THEME.spacing.xs,
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

export default LifePlanModal;
