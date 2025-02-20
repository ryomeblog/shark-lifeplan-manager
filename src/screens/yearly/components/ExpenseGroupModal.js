import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import NumberInput from "../../../components/forms/NumberInput";
import { COLORS, THEME } from "../../../constants";
import { rootStore } from "../../../stores/RootStore";
import { formatCurrency } from "../../../utils/format";

/**
 * 支出グループ管理モーダル
 */
const ExpenseGroupModal = observer(({ visible, onDismiss }) => {
  // 編集状態の管理
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // フォームの状態管理
  const [name, setName] = useState("");
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);

  const expenseGroups = rootStore.groupStore.sortedExpenseGroups;
  const expenseCategories = rootStore.categoryStore.sortedExpenseCategories;

  /**
   * グループの作成
   */
  const handleCreateGroup = () => {
    if (!name.trim()) {
      setError("グループ名を入力してください");
      return;
    }

    rootStore.groupStore.createExpenseGroup({
      name: name.trim(),
      items: [],
    });

    resetGroupForm();
  };

  /**
   * グループの更新
   */
  const handleUpdateGroup = () => {
    if (!name.trim()) {
      setError("グループ名を入力してください");
      return;
    }

    if (editingGroup) {
      rootStore.groupStore.updateExpenseGroup(editingGroup.id, {
        name: name.trim(),
      });
      resetGroupForm();
    }
  };

  /**
   * グループの削除
   */
  const handleDeleteGroup = () => {
    if (editingGroup) {
      rootStore.groupStore.deleteExpenseGroup(editingGroup.id);
      resetGroupForm();
      setDeleteDialogVisible(false);
    }
  };

  /**
   * 支出項目の作成/更新
   */
  const handleSaveItem = () => {
    if (!itemName.trim()) {
      setError("項目名を入力してください");
      return;
    }
    if (!category) {
      setError("カテゴリを選択してください");
      return;
    }
    if (amount <= 0) {
      setError("金額を入力してください");
      return;
    }

    const item = {
      name: itemName.trim(),
      amount,
      frequency,
      category,
      group: editingGroup.name,
    };

    if (editingItem) {
      rootStore.groupStore.updateExpenseGroupItem(
        editingGroup.id,
        editingItem.id,
        item,
      );
    } else {
      rootStore.groupStore.addExpenseGroupItem(editingGroup.id, item);
    }

    resetItemForm();
  };

  /**
   * 支出項目の削除
   */
  const handleDeleteItem = (itemId) => {
    rootStore.groupStore.removeExpenseGroupItem(editingGroup.id, itemId);
  };

  /**
   * グループフォームのリセット
   */
  const resetGroupForm = () => {
    setName("");
    setEditingGroup(null);
    setError(null);
  };

  /**
   * 支出項目フォームのリセット
   */
  const resetItemForm = () => {
    setItemName("");
    setAmount(0);
    setFrequency("monthly");
    setCategory("");
    setEditingItem(null);
    setShowItemForm(false);
    setError(null);
  };

  /**
   * グループ編集の開始
   */
  const startEditingGroup = (group) => {
    setEditingGroup(group);
    setName(group.name);
  };

  /**
   * 支出項目編集の開始
   */
  const startEditingItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setAmount(item.amount);
    setFrequency(item.frequency);
    setCategory(item.category);
    setShowItemForm(true);
  };

  /**
   * モーダルを閉じる
   */
  const handleDismiss = () => {
    resetGroupForm();
    resetItemForm();
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
          <Text style={styles.title}>支出グループ管理</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* グループ一覧 */}
          {expenseGroups.map((group) => (
            <List.Accordion
              key={group.id}
              title={group.name}
              description={`${group.items.length}個の支出項目`}
              left={(props) => <List.Icon {...props} icon="folder" />}
            >
              {/* グループのアクション */}
              <View style={styles.groupActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    startEditingGroup(group);
                    setShowItemForm(true);
                  }}
                  style={styles.actionButton}
                >
                  項目を追加
                </Button>
                <IconButton
                  icon="pencil"
                  onPress={() => startEditingGroup(group)}
                />
                <IconButton
                  icon="delete"
                  onPress={() => {
                    startEditingGroup(group);
                    setDeleteDialogVisible(true);
                  }}
                />
              </View>

              {/* 支出項目一覧 */}
              {group.items.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={`${formatCurrency(item.amount)} / ${item.frequency}`}
                  left={(props) => (
                    <View style={styles.categoryIndicator}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  )}
                  right={(props) => (
                    <View style={styles.itemActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => startEditingItem(item)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteItem(item.id)}
                      />
                    </View>
                  )}
                />
              ))}
            </List.Accordion>
          ))}

          {/* グループ作成フォーム */}
          {!editingGroup && (
            <View style={styles.form}>
              <TextInput
                label="グループ名"
                defaultValue={name}
                onChangeText={setName}
                style={styles.input}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button
                mode="contained"
                onPress={handleCreateGroup}
                style={styles.submitButton}
              >
                グループを作成
              </Button>
            </View>
          )}

          {/* 支出項目フォーム */}
          {showItemForm && editingGroup && (
            <View style={styles.form}>
              <TextInput
                label="項目名"
                defaultValue={itemName}
                onChangeText={setItemName}
                style={styles.input}
              />
              <NumberInput
                label="金額"
                defaultValue={amount}
                onChangeValue={setAmount}
                format="currency"
                style={styles.input}
              />
              <List.Accordion
                title="頻度"
                description={frequency}
                style={styles.input}
              >
                <List.Item
                  title="1回のみ"
                  onPress={() => setFrequency("once")}
                />
                <List.Item
                  title="毎月"
                  onPress={() => setFrequency("monthly")}
                />
                <List.Item
                  title="毎年"
                  onPress={() => setFrequency("yearly")}
                />
              </List.Accordion>
              <List.Accordion
                title="カテゴリ"
                description={category}
                style={styles.input}
              >
                {expenseCategories.map((cat) => (
                  <List.Item
                    key={cat.id}
                    title={cat.name}
                    onPress={() => setCategory(cat.name)}
                  />
                ))}
              </List.Accordion>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button
                mode="contained"
                onPress={handleSaveItem}
                style={styles.submitButton}
              >
                {editingItem ? "項目を更新" : "項目を追加"}
              </Button>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.footerButton}
          >
            閉じる
          </Button>
          {editingGroup && !showItemForm && (
            <Button
              mode="contained"
              onPress={handleUpdateGroup}
              style={styles.footerButton}
            >
              グループを更新
            </Button>
          )}
        </View>

        {/* 削除確認ダイアログ */}
        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            resetGroupForm();
          }}
          onConfirm={handleDeleteGroup}
          title="グループの削除"
          message={`${editingGroup?.name}を削除してもよろしいですか？`}
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
  groupActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: COLORS.grey[100],
  },
  actionButton: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  categoryIndicator: {
    backgroundColor: COLORS.grey[200],
    padding: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    marginRight: THEME.spacing.sm,
  },
  categoryText: {
    fontSize: THEME.typography.caption,
  },
  itemActions: {
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
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: -THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  submitButton: {
    marginTop: THEME.spacing.sm,
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

export default ExpenseGroupModal;
