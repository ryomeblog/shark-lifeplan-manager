import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, List, Modal, Portal, Text } from 'react-native-paper';
import DatePickerInput from '../../../components/forms/DatePickerInput';
import NumberInput from '../../../components/forms/NumberInput';
import TextInput from '../../../components/forms/TextInput';
import { COLORS, ENUMS, THEME } from '../../../constants';
import { rootStore } from '../../../stores/RootStore';
import { formatCurrency } from '../../../utils/format';
import { logModalShow } from '../../../utils/logger';

/**
 * 支出作成・編集モーダル
 */
const ExpenseModal = observer(({ visible, onDismiss, onSubmit, initialValues }) => {
  // フォームの状態管理
  const [formMode, setFormMode] = useState('single'); // 'single' or 'group'
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequency] = useState(ENUMS.frequency.MONTHLY);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);

  // カテゴリとグループのデータ
  const categories = rootStore.categoryStore.sortedExpenseCategories;
  const groups = rootStore.groupStore.sortedExpenseGroups;

  // 初期値のセット
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setAmount(initialValues.amount);
      setFrequency(initialValues.frequency);
      setCategory(initialValues.category);
      setDate(initialValues.date);
    }
  }, [initialValues]);

  /**
   * フォームの検証
   */
  const validateForm = () => {
    if (!name.trim()) {
      setError('項目名を入力してください');
      return false;
    }
    if (amount <= 0) {
      setError('金額を入力してください');
      return false;
    }
    if (!category && formMode === 'single') {
      setError('カテゴリを選択してください');
      return false;
    }
    return true;
  };

  /**
   * 送信処理
   */
  const handleSubmit = () => {
    if (formMode === 'single') {
      if (validateForm()) {
        onSubmit({
          name: name.trim(),
          amount,
          frequency,
          category,
          date,
        });
        resetForm();
      }
    } else {
      if (selectedItems.length === 0) {
        setError('項目を選択してください');
        return;
      }
      onSubmit(
        selectedItems.map(item => ({
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          category: item.category,
          date: item.date,
        })),
      );
      resetForm();
    }
  };

  /**
   * フォームのリセット
   */
  const resetForm = () => {
    setFormMode('single');
    setName('');
    setAmount(0);
    setFrequency(ENUMS.frequency.MONTHLY);
    setCategory('');
    setDate(null);
    setSelectedGroup(null);
    setSelectedItems([]);
    setError(null);
  };

  /**
   * グループ選択時の処理
   */
  const handleGroupSelect = group => {
    setSelectedGroup(group);
    setSelectedItems(group.items);
  };

  /**
   * 項目選択の切り替え
   */
  const toggleItemSelection = item => {
    const index = selectedItems.findIndex(i => i.id === item.id);
    if (index === -1) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        onShow={() => logModalShow('支出モーダル')}
        contentContainerStyle={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{initialValues ? '支出の編集' : '支出の追加'}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* 入力モード選択 */}
          {!initialValues && (
            <List.Section>
              <List.Item
                title="単一項目の追加"
                left={() => (
                  <List.Icon icon={formMode === 'single' ? 'radiobox-marked' : 'radiobox-blank'} />
                )}
                onPress={() => setFormMode('single')}
              />
              <List.Item
                title="グループからの追加"
                left={() => (
                  <List.Icon icon={formMode === 'group' ? 'radiobox-marked' : 'radiobox-blank'} />
                )}
                onPress={() => setFormMode('group')}
              />
            </List.Section>
          )}

          {/* 単一項目フォーム */}
          {formMode === 'single' && (
            <View style={styles.form}>
              <TextInput
                label="項目名"
                defaultValue={name}
                onChangeText={setName}
                style={styles.input}
              />
              <NumberInput
                label="金額"
                defaultValue={amount}
                onChangeValue={setAmount}
                format="currency"
                style={styles.input}
              />
              <List.Accordion title="頻度" description={frequency} style={styles.input}>
                <List.Item title="1回のみ" onPress={() => setFrequency(ENUMS.frequency.ONCE)} />
                <List.Item title="毎月" onPress={() => setFrequency(ENUMS.frequency.MONTHLY)} />
                <List.Item title="毎年" onPress={() => setFrequency(ENUMS.frequency.YEARLY)} />
              </List.Accordion>
              <List.Accordion title="カテゴリ" description={category} style={styles.input}>
                {categories.map(cat => (
                  <List.Item
                    key={cat.id}
                    title={cat.name}
                    onPress={() => setCategory(cat.name)}
                    left={props => (
                      <View style={[styles.categoryColor, { backgroundColor: cat.color }]} />
                    )}
                  />
                ))}
              </List.Accordion>
              {frequency === ENUMS.frequency.ONCE && (
                <DatePickerInput
                  label="発生日"
                  value={date}
                  onChange={setDate}
                  style={styles.input}
                />
              )}
            </View>
          )}

          {/* グループ選択フォーム */}
          {formMode === 'group' && (
            <View style={styles.form}>
              <List.Section title="支出グループ">
                {groups.map(group => (
                  <List.Accordion
                    key={group.id}
                    title={group.name}
                    expanded={selectedGroup?.id === group.id}
                    onPress={() => handleGroupSelect(group)}>
                    {group.items.map(item => (
                      <List.Item
                        key={item.id}
                        title={item.name}
                        description={`${formatCurrency(item.amount)} / ${item.frequency}`}
                        left={props => (
                          <Checkbox
                            status={
                              selectedItems.some(i => i.id === item.id) ? 'checked' : 'unchecked'
                            }
                            onPress={() => toggleItemSelection(item)}
                          />
                        )}
                      />
                    ))}
                  </List.Accordion>
                ))}
              </List.Section>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Button mode="outlined" onPress={onDismiss} style={styles.footerButton}>
            キャンセル
          </Button>
          <Button mode="contained" onPress={handleSubmit} style={styles.footerButton}>
            {initialValues ? '更新' : '追加'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: COLORS.common.white,
    margin: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    maxHeight: '90%',
  },
  header: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: THEME.typography.h3,
    fontWeight: 'bold',
  },
  content: {
    padding: THEME.spacing.md,
  },
  form: {
    marginTop: THEME.spacing.md,
  },
  input: {
    marginBottom: THEME.spacing.md,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: THEME.spacing.sm,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: THEME.typography.caption,
    marginTop: THEME.spacing.xs,
    marginBottom: THEME.spacing.sm,
    marginLeft: THEME.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  footerButton: {
    marginLeft: THEME.spacing.sm,
    minWidth: 100,
  },
});

export default ExpenseModal;
