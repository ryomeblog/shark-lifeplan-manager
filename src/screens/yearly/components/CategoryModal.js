import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ColorPicker } from "react-native-color-picker";
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { COLORS, THEME } from "../../../constants";
import { rootStore } from "../../../stores/RootStore";
import { validateColorCode } from "../../../utils/validate";

/**
 * カテゴリ管理モーダル
 */
const CategoryModal = observer(({ visible, onDismiss, type }) => {
  // 編集状態の管理
  const [editingCategory, setEditingCategory] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // フォームの状態管理
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS.primary.main);
  const [error, setError] = useState(null);

  /**
   * カテゴリの取得
   */
  const getCategories = () => {
    switch (type) {
      case "income":
        return rootStore.categoryStore.sortedIncomeCategories;
      case "expense":
        return rootStore.categoryStore.sortedExpenseCategories;
      case "asset":
        return rootStore.categoryStore.sortedAssetCategories;
      default:
        return [];
    }
  };

  /**
   * カテゴリの作成
   */
  const handleCreate = () => {
    try {
      validateColorCode(color, "カラー");
      const data = { name, description, color };

      switch (type) {
        case "income":
          rootStore.categoryStore.createIncomeCategory(data);
          break;
        case "expense":
          rootStore.categoryStore.createExpenseCategory(data);
          break;
        case "asset":
          rootStore.categoryStore.createAssetCategory(data);
          break;
      }

      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * カテゴリの更新
   */
  const handleUpdate = () => {
    try {
      validateColorCode(color, "カラー");
      const data = { name, description, color };

      switch (type) {
        case "income":
          rootStore.categoryStore.updateIncomeCategory(
            editingCategory.id,
            data,
          );
          break;
        case "expense":
          rootStore.categoryStore.updateExpenseCategory(
            editingCategory.id,
            data,
          );
          break;
        case "asset":
          rootStore.categoryStore.updateAssetCategory(editingCategory.id, data);
          break;
      }

      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * カテゴリの削除
   */
  const handleDelete = () => {
    if (editingCategory) {
      switch (type) {
        case "income":
          rootStore.categoryStore.deleteIncomeCategory(editingCategory.id);
          break;
        case "expense":
          rootStore.categoryStore.deleteExpenseCategory(editingCategory.id);
          break;
        case "asset":
          rootStore.categoryStore.deleteAssetCategory(editingCategory.id);
          break;
      }

      resetForm();
      setDeleteDialogVisible(false);
    }
  };

  /**
   * フォームのリセット
   */
  const resetForm = () => {
    setName("");
    setDescription("");
    setColor(COLORS.primary.main);
    setEditingCategory(null);
    setError(null);
  };

  /**
   * 編集の開始
   */
  const startEditing = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setColor(category.color);
  };

  /**
   * モーダルを閉じる
   */
  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  // カテゴリ種別に応じたタイトル
  const getTitle = () => {
    switch (type) {
      case "income":
        return "収入カテゴリ管理";
      case "expense":
        return "支出カテゴリ管理";
      case "asset":
        return "資産カテゴリ管理";
      default:
        return "カテゴリ管理";
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* カテゴリ一覧 */}
          {getCategories().map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: category.color },
                  ]}
                />
                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.description && (
                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.categoryActions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => startEditing(category)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => {
                    startEditing(category);
                    setDeleteDialogVisible(true);
                  }}
                />
              </View>
            </View>
          ))}

          {/* フォーム */}
          <View style={styles.form}>
            <TextInput
              label="カテゴリ名"
              defaultValue={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              label="説明"
              defaultValue={description}
              onChangeText={setDescription}
              multiline
              style={styles.input}
            />
            <View style={styles.colorContainer}>
              <Text style={styles.colorLabel}>カラー</Text>
              <Button
                mode="outlined"
                onPress={() => setShowColorPicker(true)}
                style={styles.colorButton}
              >
                カラーを選択
              </Button>
              <View
                style={[
                  styles.colorPreview,
                  styles.colorPreviewLarge,
                  { backgroundColor: color },
                ]}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
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
            onPress={editingCategory ? handleUpdate : handleCreate}
            style={styles.footerButton}
          >
            {editingCategory ? "更新" : "作成"}
          </Button>
        </View>

        {/* カラーピッカーモーダル */}
        <Modal
          visible={showColorPicker}
          onDismiss={() => setShowColorPicker(false)}
          contentContainerStyle={styles.colorPickerContainer}
        >
          <ColorPicker
            onColorSelected={(color) => {
              setColor(color);
              setShowColorPicker(false);
            }}
            style={styles.colorPicker}
          />
        </Modal>

        {/* 削除確認ダイアログ */}
        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            resetForm();
          }}
          onConfirm={handleDelete}
          title="カテゴリの削除"
          message={`${editingCategory?.name}を削除してもよろしいですか？`}
          confirmLabel="削除"
          confirmColor={COLORS.accent.error}
        />
      </Modal>
    </Portal>
  );
});

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
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: THEME.spacing.sm,
  },
  colorPreviewLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: THEME.typography.body1,
    fontWeight: "bold",
  },
  categoryDescription: {
    fontSize: THEME.typography.caption,
    color: COLORS.grey[600],
  },
  categoryActions: {
    flexDirection: "row",
  },
  form: {
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  input: {
    marginBottom: THEME.spacing.md,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  colorLabel: {
    fontSize: THEME.typography.body1,
    marginRight: THEME.spacing.md,
  },
  colorButton: {
    marginRight: THEME.spacing.md,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: THEME.spacing.xs,
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
  colorPickerContainer: {
    backgroundColor: COLORS.common.white,
    margin: THEME.spacing.lg,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    height: 400,
  },
  colorPicker: {
    flex: 1,
  },
});

export default CategoryModal;
