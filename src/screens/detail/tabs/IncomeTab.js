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
import IncomeModal from '../components/IncomeModal';

/**
 * 収入タブ
 */
const IncomeTab = observer(({ lifePlanId, yearData }) => {
  const theme = useTheme();

  // モーダルの表示状態
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  /**
   * カテゴリ別の収入集計データを計算
   */
  const categoryData = useMemo(() => {
    const data = new Map();
    yearData.incomes.forEach(income => {
      const amount = data.get(income.category) || 0;
      data.set(income.category, amount + income.amount);
    });

    const categories = rootStore.categoryStore.sortedIncomeCategories;
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
  }, [yearData.incomes]);

  /**
   * 総収入額を計算
   */
  const totalIncome = useMemo(() => {
    return yearData.incomes.reduce((sum, income) => sum + income.amount, 0);
  }, [yearData.incomes]);

  /**
   * 収入の作成
   */
  const handleCreate = data => {
    if (Array.isArray(data)) {
      // グループからの一括追加の場合
      const newIncomes = data.map(item => ({ id: nanoid(), ...item }));
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        incomes: [...yearData.incomes, ...newIncomes],
      });
    } else {
      // 単一項目の追加の場合
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        incomes: [...yearData.incomes, { id: nanoid(), ...data }],
      });
    }
    setModalVisible(false);
  };

  /**
   * 収入の更新
   */
  const handleUpdate = data => {
    if (editingIncome) {
      const updatedIncomes = yearData.incomes.map(income =>
        income.id === editingIncome.id ? { ...income, ...data } : income,
      );
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        incomes: updatedIncomes,
      });
      setModalVisible(false);
      setEditingIncome(null);
    }
  };

  /**
   * 収入の削除
   */
  const handleDelete = () => {
    if (editingIncome) {
      const updatedIncomes = yearData.incomes.filter(income => income.id !== editingIncome.id);
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        incomes: updatedIncomes,
      });
      setDeleteDialogVisible(false);
      setEditingIncome(null);
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
            <Text style={styles.totalAmount}>総収入額: {formatCurrency(totalIncome)}</Text>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>収入データがありません</Text>
          </View>
        )}

        {/* 収入一覧 */}
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>項目</DataTable.Title>
            <DataTable.Title>カテゴリ</DataTable.Title>
            <DataTable.Title numeric>金額</DataTable.Title>
            <DataTable.Title numeric>頻度</DataTable.Title>
            <DataTable.Title numeric>アクション</DataTable.Title>
          </DataTable.Header>

          {yearData.incomes.map(income => (
            <DataTable.Row key={income.id}>
              <DataTable.Cell>{income.name}</DataTable.Cell>
              <DataTable.Cell>{income.category}</DataTable.Cell>
              <DataTable.Cell numeric>{formatCurrency(income.amount)}</DataTable.Cell>
              <DataTable.Cell numeric>{income.frequency}</DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => {
                      setEditingIncome(income);
                      setModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      setEditingIncome(income);
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
        icon="plus-circle"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />

      {/* モーダル */}
      <Portal>
        <IncomeModal
          visible={isModalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingIncome(null);
          }}
          onSubmit={editingIncome ? handleUpdate : handleCreate}
          initialValues={editingIncome}
        />

        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setEditingIncome(null);
          }}
          onConfirm={handleDelete}
          title="収入の削除"
          message={`${editingIncome?.name}を削除してもよろしいですか？`}
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

export default IncomeTab;
