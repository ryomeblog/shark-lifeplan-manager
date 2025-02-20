import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Checkbox,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import DatePickerInput from "../../../components/forms/DatePickerInput";
import TextInput from "../../../components/forms/TextInput";
import { COLORS, THEME } from "../../../constants";
import { formatCurrency } from "../../../utils/format";

/**
 * イベント作成・編集モーダル
 */
const EventModal = observer(
  ({ visible, onDismiss, onSubmit, initialValues, yearData }) => {
    // フォームの状態管理
    const [name, setName] = useState("");
    const [date, setDate] = useState(null);
    const [description, setDescription] = useState("");
    const [selectedIncomes, setSelectedIncomes] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [error, setError] = useState(null);

    // 初期値のセット
    useEffect(() => {
      if (initialValues) {
        setName(initialValues.name);
        setDate(initialValues.date);
        setDescription(initialValues.description || "");
        setSelectedIncomes(initialValues.impactDetails?.incomes || []);
        setSelectedExpenses(initialValues.impactDetails?.expenses || []);
        setSelectedAssets(initialValues.impactDetails?.assets || []);
      }
    }, [initialValues]);

    /**
     * フォームの検証
     */
    const validateForm = () => {
      if (!name.trim()) {
        setError("イベント名を入力してください");
        return false;
      }
      if (!date) {
        setError("発生日を選択してください");
        return false;
      }
      return true;
    };

    /**
     * 送信処理
     */
    const handleSubmit = () => {
      if (validateForm()) {
        onSubmit({
          name: name.trim(),
          date,
          description: description.trim(),
          impactDetails: {
            incomes: selectedIncomes,
            expenses: selectedExpenses,
            assets: selectedAssets,
          },
        });
        resetForm();
      }
    };

    /**
     * フォームのリセット
     */
    const resetForm = () => {
      setName("");
      setDate(null);
      setDescription("");
      setSelectedIncomes([]);
      setSelectedExpenses([]);
      setSelectedAssets([]);
      setError(null);
    };

    /**
     * アイテムの選択状態を切り替え
     */
    const toggleSelection = (id, type) => {
      switch (type) {
        case "income":
          if (selectedIncomes.includes(id)) {
            setSelectedIncomes(selectedIncomes.filter((i) => i !== id));
          } else {
            setSelectedIncomes([...selectedIncomes, id]);
          }
          break;
        case "expense":
          if (selectedExpenses.includes(id)) {
            setSelectedExpenses(selectedExpenses.filter((e) => e !== id));
          } else {
            setSelectedExpenses([...selectedExpenses, id]);
          }
          break;
        case "asset":
          if (selectedAssets.includes(id)) {
            setSelectedAssets(selectedAssets.filter((a) => a !== id));
          } else {
            setSelectedAssets([...selectedAssets, id]);
          }
          break;
      }
    };

    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialValues ? "イベントの編集" : "イベントの追加"}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            {/* 基本情報フォーム */}
            <TextInput
              label="イベント名"
              defaultValue={name}
              onChangeText={setName}
              style={styles.input}
            />
            <DatePickerInput
              label="発生日"
              value={date}
              onChange={setDate}
              style={styles.input}
            />
            <TextInput
              label="説明"
              defaultValue={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            {/* 関連する収支・資産の選択 */}
            {yearData.incomes.length > 0 && (
              <List.Section title="関連する収入">
                {yearData.incomes.map((income) => (
                  <List.Item
                    key={income.id}
                    title={income.name}
                    description={formatCurrency(income.amount)}
                    left={(props) => (
                      <Checkbox
                        status={
                          selectedIncomes.includes(income.id)
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => toggleSelection(income.id, "income")}
                      />
                    )}
                  />
                ))}
              </List.Section>
            )}

            {yearData.expenses.length > 0 && (
              <List.Section title="関連する支出">
                {yearData.expenses.map((expense) => (
                  <List.Item
                    key={expense.id}
                    title={expense.name}
                    description={formatCurrency(expense.amount)}
                    left={(props) => (
                      <Checkbox
                        status={
                          selectedExpenses.includes(expense.id)
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => toggleSelection(expense.id, "expense")}
                      />
                    )}
                  />
                ))}
              </List.Section>
            )}

            {yearData.assets.length > 0 && (
              <List.Section title="関連する資産">
                {yearData.assets.map((asset) => (
                  <List.Item
                    key={asset.id}
                    title={asset.name}
                    description={formatCurrency(asset.initialAmount)}
                    left={(props) => (
                      <Checkbox
                        status={
                          selectedAssets.includes(asset.id)
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => toggleSelection(asset.id, "asset")}
                      />
                    )}
                  />
                ))}
              </List.Section>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.footerButton}
            >
              キャンセル
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.footerButton}
            >
              {initialValues ? "更新" : "追加"}
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  },
);

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
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: THEME.spacing.xs,
    marginBottom: THEME.spacing.sm,
    marginLeft: THEME.spacing.sm,
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

export default EventModal;
