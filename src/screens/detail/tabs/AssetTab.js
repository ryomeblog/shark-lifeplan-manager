import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import {
  Card,
  DataTable,
  FAB,
  IconButton,
  Paragraph,
  Portal,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { COLORS, THEME } from "../../../constants";
import { rootStore } from "../../../stores/RootStore";
import { formatCurrency, formatPercentage } from "../../../utils/format";
import AssetModal from "../components/AssetModal";

/**
 * 資産タブ
 */
const AssetTab = observer(({ lifePlanId, yearData }) => {
  const theme = useTheme();

  // モーダルの表示状態
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  /**
   * カテゴリ別の資産集計データを計算
   */
  const categoryData = useMemo(() => {
    const data = new Map();
    yearData.assets.forEach((asset) => {
      const amount = data.get(asset.category) || 0;
      data.set(asset.category, amount + asset.initialAmount);
    });

    const categories = rootStore.categoryStore.sortedAssetCategories;
    return Array.from(data.entries()).map(([category, amount]) => {
      const categoryInfo = categories.find((c) => c.name === category);
      return {
        name: category,
        amount,
        color: categoryInfo?.color || COLORS.grey[500],
        legendFontColor: COLORS.grey[900],
        legendFontSize: 12,
      };
    });
  }, [yearData.assets]);

  /**
   * 総資産額とパフォーマンスを計算
   */
  const assetSummary = useMemo(() => {
    let totalInitialAmount = 0;
    let totalCurrentAmount = 0;
    let totalCapitalGain = 0;
    let totalDividend = 0;

    yearData.assets.forEach((asset) => {
      totalInitialAmount += asset.initialAmount;

      const performance = asset.yearlyPerformance.find(
        (p) => p.year === yearData.year,
      );

      if (performance) {
        totalCurrentAmount +=
          performance.actualEndValue || performance.endValue;
        totalCapitalGain +=
          performance.actualCapitalGains || performance.capitalGains;
        totalDividend +=
          performance.actualTotalDividends || performance.totalDividends;
      }
    });

    const totalReturn = totalCapitalGain + totalDividend;
    const returnRate =
      totalInitialAmount > 0 ? totalReturn / totalInitialAmount : 0;

    return {
      initialAmount: totalInitialAmount,
      currentAmount: totalCurrentAmount,
      capitalGain: totalCapitalGain,
      dividend: totalDividend,
      totalReturn,
      returnRate,
    };
  }, [yearData.assets]);

  /**
   * パフォーマンスグラフのデータを作成
   */
  const performanceData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const expectedData = new Array(12).fill(0);
    const actualData = new Array(12).fill(0);

    yearData.assets.forEach((asset) => {
      const performance = asset.yearlyPerformance.find(
        (p) => p.year === yearData.year,
      );

      if (performance) {
        const monthlyGain = performance.capitalGains / 12;
        const monthlyDividend = performance.totalDividends / 12;

        months.forEach((_, index) => {
          expectedData[index] += monthlyGain + monthlyDividend;

          if (
            performance.actualCapitalGains &&
            performance.actualTotalDividends
          ) {
            actualData[index] +=
              (performance.actualCapitalGains +
                performance.actualTotalDividends) /
              12;
          }
        });
      }
    });

    return {
      labels: months.map((m) => `${m}月`),
      datasets: [
        {
          data: expectedData,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: actualData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [yearData.assets]);

  /**
   * 資産の作成
   */
  const handleCreate = (data) => {
    rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
      assets: [...yearData.assets, { id: nanoid(), ...data }],
    });
    setModalVisible(false);
  };

  /**
   * 資産の更新
   */
  const handleUpdate = (data) => {
    if (editingAsset) {
      const updatedAssets = yearData.assets.map((asset) =>
        asset.id === editingAsset.id ? { ...asset, ...data } : asset,
      );
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        assets: updatedAssets,
      });
      setModalVisible(false);
      setEditingAsset(null);
    }
  };

  /**
   * 資産の削除
   */
  const handleDelete = () => {
    if (editingAsset) {
      const updatedAssets = yearData.assets.filter(
        (asset) => asset.id !== editingAsset.id,
      );
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        assets: updatedAssets,
      });
      setDeleteDialogVisible(false);
      setEditingAsset(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* サマリーカード */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>資産サマリー</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Paragraph>初期投資額</Paragraph>
                <Text style={styles.summaryValue}>
                  {formatCurrency(assetSummary.initialAmount)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Paragraph>現在の評価額</Paragraph>
                <Text style={styles.summaryValue}>
                  {formatCurrency(assetSummary.currentAmount)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Paragraph>キャピタルゲイン</Paragraph>
                <Text style={styles.summaryValue}>
                  {formatCurrency(assetSummary.capitalGain)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Paragraph>配当収入</Paragraph>
                <Text style={styles.summaryValue}>
                  {formatCurrency(assetSummary.dividend)}
                </Text>
              </View>
            </View>
            <View style={styles.totalReturn}>
              <Paragraph>総リターン</Paragraph>
              <Text style={styles.totalReturnValue}>
                {formatCurrency(assetSummary.totalReturn)}{" "}
                <Text style={styles.returnRate}>
                  ({formatPercentage(assetSummary.returnRate)})
                </Text>
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* カテゴリ別円グラフ */}
        {categoryData.length > 0 ? (
          <View style={styles.chartContainer}>
            <Title>資産配分</Title>
            <PieChart
              data={categoryData}
              width={DEVICE.width - THEME.spacing.lg * 2}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>資産データがありません</Text>
          </View>
        )}

        {/* パフォーマンスグラフ */}
        {yearData.assets.length > 0 && (
          <Card style={styles.performanceCard}>
            <Card.Content>
              <Title>パフォーマンス推移</Title>
              <LineChart
                data={performanceData}
                width={DEVICE.width - THEME.spacing.lg * 2}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.common.white,
                  backgroundGradientFrom: COLORS.common.white,
                  backgroundGradientTo: COLORS.common.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={styles.performanceChart}
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#2196F3" }]}
                  />
                  <Text>予想</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
                  />
                  <Text>実績</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* 資産一覧 */}
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>項目</DataTable.Title>
            <DataTable.Title>カテゴリ</DataTable.Title>
            <DataTable.Title numeric>投資額</DataTable.Title>
            <DataTable.Title numeric>評価額</DataTable.Title>
            <DataTable.Title numeric>アクション</DataTable.Title>
          </DataTable.Header>

          {yearData.assets.map((asset) => {
            const performance = asset.yearlyPerformance.find(
              (p) => p.year === yearData.year,
            );
            const currentValue = performance
              ? performance.actualEndValue || performance.endValue
              : asset.initialAmount;

            return (
              <DataTable.Row key={asset.id}>
                <DataTable.Cell>{asset.name}</DataTable.Cell>
                <DataTable.Cell>{asset.category}</DataTable.Cell>
                <DataTable.Cell numeric>
                  {formatCurrency(asset.initialAmount)}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {formatCurrency(currentValue)}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => {
                        setEditingAsset(asset);
                        setModalVisible(true);
                      }}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => {
                        setEditingAsset(asset);
                        setDeleteDialogVisible(true);
                      }}
                    />
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
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
        <AssetModal
          visible={isModalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingAsset(null);
          }}
          onSubmit={editingAsset ? handleUpdate : handleCreate}
          initialValues={editingAsset}
          year={yearData.year}
        />

        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setEditingAsset(null);
          }}
          onConfirm={handleDelete}
          title="資産の削除"
          message={`${editingAsset?.name}を削除してもよろしいですか？`}
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
  summaryCard: {
    margin: THEME.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: THEME.spacing.xs,
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    fontSize: THEME.typography.h5,
    fontWeight: "bold",
  },
  totalReturn: {
    marginTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    paddingTop: THEME.spacing.md,
  },
  totalReturnValue: {
    fontSize: THEME.typography.h4,
    fontWeight: "bold",
    color: COLORS.accent.success,
  },
  returnRate: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
  },
  chartContainer: {
    padding: THEME.spacing.md,
  },
  performanceCard: {
    margin: THEME.spacing.md,
  },
  performanceChart: {
    marginVertical: THEME.spacing.md,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: THEME.spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: THEME.spacing.md,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: THEME.spacing.xs,
  },
  emptyChart: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fab: {
    position: "absolute",
    margin: THEME.spacing.md,
    right: 0,
    bottom: 0,
  },
});

export default AssetTab;
