import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, DataTable, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { COLORS, THEME } from '../../constants';
import { rootStore } from '../../stores/RootStore';
import { formatCurrency } from '../../utils/format';
import CategoryModal from './components/CategoryModal';
import ExpenseGroupModal from './components/ExpenseGroupModal';
import IncomeGroupModal from './components/IncomeGroupModal';
import YearCopyModal from './components/YearCopyModal';

/**
 * 年別収支一覧画面
 */
const YearlyListScreen = observer(({ route, navigation }) => {
  const theme = useTheme();
  const { lifePlanId } = route.params;
  const lifePlan = rootStore.lifePlanStore.lifePlans.get(lifePlanId);

  useEffect(() => {
    console.log(`YearlyListScreen: 画面がマウントされました (LifePlanId: ${lifePlanId})`);
    return () =>
      console.log(`YearlyListScreen: 画面がアンマウントされました (LifePlanId: ${lifePlanId})`);
  }, [lifePlanId]);

  // モーダルの表示状態
  const [isExpenseGroupModalVisible, setExpenseGroupModalVisible] = useState(false);
  const [isIncomeGroupModalVisible, setIncomeGroupModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState(null);
  const [isYearCopyModalVisible, setYearCopyModalVisible] = useState(false);

  // 選択状態
  const [selectedYear, setSelectedYear] = useState(null);
  const [isClearDialogVisible, setClearDialogVisible] = useState(false);

  /**
   * 年別データのクリア
   */
  const handleClearYear = () => {
    if (selectedYear) {
      rootStore.lifePlanStore.clearYearlyFinance(lifePlanId, selectedYear.id);
      setClearDialogVisible(false);
      setSelectedYear(null);
    }
  };

  /**
   * 年別データのコピー
   */
  const handleCopyYear = targetYear => {
    if (selectedYear) {
      rootStore.lifePlanStore.copyYearlyFinance(lifePlanId, selectedYear.id, targetYear);
      setYearCopyModalVisible(false);
      setSelectedYear(null);
    }
  };

  /**
   * 年の選択
   */
  const handleSelectYear = yearData => {
    navigation.navigate('Detail', {
      lifePlanId,
      yearId: yearData.id,
      year: yearData.year,
    });
  };

  /**
   * カテゴリ管理モーダルを開く
   */
  const openCategoryModal = type => {
    setCategoryType(type);
    setCategoryModalVisible(true);
  };

  if (!lifePlan) {
    return (
      <View style={styles.centerContainer}>
        <Text>ライフプランが見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 管理ボタン群 */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setExpenseGroupModalVisible(true)}
          style={styles.button}>
          支出グループ管理
        </Button>
        <Button
          mode="outlined"
          onPress={() => setIncomeGroupModalVisible(true)}
          style={styles.button}>
          収入グループ管理
        </Button>
        <Button mode="outlined" onPress={() => openCategoryModal('expense')} style={styles.button}>
          支出カテゴリ管理
        </Button>
        <Button mode="outlined" onPress={() => openCategoryModal('income')} style={styles.button}>
          収入カテゴリ管理
        </Button>
        <Button mode="outlined" onPress={() => openCategoryModal('asset')} style={styles.button}>
          資産カテゴリ管理
        </Button>
      </View>

      {/* 年別データ一覧 */}
      <ScrollView style={styles.content}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>年</DataTable.Title>
            <DataTable.Title numeric>収入合計</DataTable.Title>
            <DataTable.Title numeric>支出合計</DataTable.Title>
            <DataTable.Title numeric>資産合計</DataTable.Title>
            <DataTable.Title numeric>アクション</DataTable.Title>
          </DataTable.Header>

          {lifePlan.yearlyFinances.map(yearData => {
            const totalIncome = yearData.incomes.reduce((sum, income) => sum + income.amount, 0);
            const totalExpense = yearData.expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0,
            );
            const totalAsset = yearData.assets.reduce((sum, asset) => sum + asset.initialAmount, 0);

            return (
              <DataTable.Row
                key={yearData.id}
                onPress={() => handleSelectYear(yearData)}
                style={styles.row}>
                <DataTable.Cell>{yearData.year}年</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(totalIncome)}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(totalExpense)}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(totalAsset)}</DataTable.Cell>
                <DataTable.Cell numeric>
                  <View style={styles.actions}>
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={() => {
                        setSelectedYear(yearData);
                        setYearCopyModalVisible(true);
                      }}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => {
                        setSelectedYear(yearData);
                        setClearDialogVisible(true);
                      }}
                    />
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable>
      </ScrollView>

      {/* モーダル類 */}
      <Portal>
        {/* 支出グループ管理モーダル */}
        <ExpenseGroupModal
          visible={isExpenseGroupModalVisible}
          onDismiss={() => setExpenseGroupModalVisible(false)}
        />

        {/* 収入グループ管理モーダル */}
        <IncomeGroupModal
          visible={isIncomeGroupModalVisible}
          onDismiss={() => setIncomeGroupModalVisible(false)}
        />

        {/* カテゴリ管理モーダル */}
        <CategoryModal
          visible={isCategoryModalVisible}
          onDismiss={() => setCategoryModalVisible(false)}
          type={categoryType}
        />

        {/* 年コピーモーダル */}
        <YearCopyModal
          visible={isYearCopyModalVisible}
          onDismiss={() => {
            setYearCopyModalVisible(false);
            setSelectedYear(null);
          }}
          onSubmit={handleCopyYear}
          currentYear={selectedYear?.year}
          yearlyFinances={lifePlan.yearlyFinances}
        />

        {/* クリア確認ダイアログ */}
        <ConfirmDialog
          visible={isClearDialogVisible}
          onDismiss={() => {
            setClearDialogVisible(false);
            setSelectedYear(null);
          }}
          onConfirm={handleClearYear}
          title="年別データのクリア"
          message={`${selectedYear?.year}年のデータをクリアしてもよろしいですか？`}
          confirmLabel="クリア"
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  button: {
    margin: THEME.spacing.xs,
  },
  content: {
    flex: 1,
  },
  row: {
    minHeight: 60,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default YearlyListScreen;
