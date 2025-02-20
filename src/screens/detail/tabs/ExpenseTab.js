import { observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { DataTable, FAB, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS, THEME } from '../../../constants';
import { rootStore } from '../../../stores/RootStore';
import { formatCurrency } from '../../../utils/format';
import ExpenseModal from '../components/ExpenseModal';

/**
 * 支出タブ
 */
const ExpenseTab = observer(({ lifePlanId, yearData }) => {
  const theme = useTheme();

  // モーダルの表示状態
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  /**
   * カテゴリ別の支出集計データを計算
   */
  const categoryData = useMemo(() => {
    const data = new Map();
    yearData.expenses.forEach(expense => {
      const amount = data.get(expense.category) || 0;
      data.set(expense.category, amount + expense.amount);
    });

    const categories = rootStore.categoryStore.sortedExpenseCategories;
    return Array.from(data.entries()).map(([category, amount]) => {
      const categoryInfo = categories.find(c => c.name === category);
      return {
        name: category,
        amount,
        color: categoryInfo?.color || COLORS.grey[500],
        legendFontColor: COLORS.grey[900],
        legendFontSize: 12,
      };
    });
  }, [yearData.expenses]);

  /**
   * 総支出額を計算
   */
  const totalExpense = useMemo(() => {
    return yearData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [yearData.expenses]);

  /**
   * 支出の作成
   */
  const handleCreate = data => {
    rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
      expenses: [...yearData.expenses, { id: nanoid(), ...data }],
    });
    setModalVisible(false);
  };

  /**
   * 支出の更新
   */
  const handleUpdate = data => {
    if (editingExpense) {
      const updatedExpenses = yearData.expenses.map(expense =>
        expense.id === editingExpense.id ? { ...expense, ...data } : expense,
      );
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        expenses: updatedExpenses,
      });
      setModalVisible(false);
      setEditingExpense(null);
    }
  };

  /**
   * 支出の削除
   */
  const handleDelete = () => {
    if (editingExpense) {
      const updatedExpenses = yearData.expenses.filter(expense => expense.id !== editingExpense.id);
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        expenses: updatedExpenses,
      });
      setDeleteDialogVisible(false);
      setEditingExpense(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 円グラフ */}
        {categoryData.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={categoryData}
              width={Dimensions.get('window').width - THEME.spacing.lg * 2}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <Text style={styles.totalAmount}>総支出額: {formatCurrency(totalExpense)}</Text>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>支出データがありません</Text>
          </View>
        )}

        {/* 支出一覧 */}
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>項目</DataTable.Title>
            <DataTable.Title>カテゴリ</DataTable.Title>
            <DataTable.Title numeric>金額</DataTable.Title>
            <DataTable.Title numeric>頻度</DataTable.Title>
            <DataTable.Title numeric>アクション</DataTable.Title>
          </DataTable.Header>

          {yearData.expenses.map(expense => (
            <DataTable.Row key={expense.id}>
              <DataTable.Cell>{expense.name}</DataTable.Cell>
              <DataTable.Cell>{expense.category}</DataTable.Cell>
              <DataTable.Cell numeric>{formatCurrency(expense.amount)}</DataTable.Cell>
              <DataTable.Cell numeric>{expense.frequency}</DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => {
                      setEditingExpense(expense);
                      setModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      setEditingExpense(expense);
                      setDeleteDialogVisible(true);
                    }}
                  />
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      {/* FABボタン */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />

      {/* モーダル */}
      <Portal>
        <ExpenseModal
          visible={isModalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingExpense(null);
          }}
          onSubmit={editingExpense ? handleUpdate : handleCreate}
          initialValues={editingExpense}
        />

        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setEditingExpense(null);
          }}
          onConfirm={handleDelete}
          title="支出の削除"
          message={`${editingExpense?.name}を削除してもよろしいですか？`}
          confirmLabel="削除"
          confirmColor={COLORS.accent.error}
        />
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.common.white,
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: THEME.typography.h4,
    fontWeight: 'bold',
    marginTop: THEME.spacing.md,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    margin: THEME.spacing.md,
    right: 0,
    bottom: 0,
  },
});

export default ExpenseTab;
