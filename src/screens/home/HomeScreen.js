import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  DataTable,
  FAB,
  IconButton,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { COLORS, THEME } from "../../constants";
import { rootStore } from "../../stores/RootStore";
import { formatDate } from "../../utils/format";
import LifePlanModal from "./components/LifePlanModal";

/**
 * ライフプラン一覧画面
 */
const HomeScreen = observer(({ navigation }) => {
  const theme = useTheme();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedLifePlan, setSelectedLifePlan] = useState(null);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const lifePlans = rootStore.lifePlanStore.sortedLifePlans;

  /**
   * ライフプランの作成
   */
  const handleCreate = (data) => {
    rootStore.lifePlanStore.createLifePlan(data);
    setCreateModalVisible(false);
  };

  /**
   * ライフプランの更新
   */
  const handleUpdate = (data) => {
    if (selectedLifePlan) {
      rootStore.lifePlanStore.updateLifePlan(selectedLifePlan.id, data);
      setEditModalVisible(false);
      setSelectedLifePlan(null);
    }
  };

  /**
   * ライフプランの削除
   */
  const handleDelete = () => {
    if (selectedLifePlan) {
      rootStore.lifePlanStore.deleteLifePlan(selectedLifePlan.id);
      setDeleteDialogVisible(false);
      setSelectedLifePlan(null);
    }
  };

  /**
   * ライフプランのコピー
   */
  const handleCopy = (lifePlan) => {
    rootStore.lifePlanStore.copyLifePlan(lifePlan.id);
  };

  /**
   * ライフプラン選択時の処理
   */
  const handleSelect = (lifePlan) => {
    rootStore.lifePlanStore.activeLifePlanId = lifePlan.id;
    navigation.navigate("YearlyList", { lifePlanId: lifePlan.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>名称</DataTable.Title>
            <DataTable.Title>開始年</DataTable.Title>
            <DataTable.Title>想定寿命</DataTable.Title>
            <DataTable.Title numeric>アクション</DataTable.Title>
          </DataTable.Header>

          {lifePlans.map((lifePlan) => (
            <DataTable.Row
              key={lifePlan.id}
              onPress={() => handleSelect(lifePlan)}
              style={styles.row}
            >
              <DataTable.Cell>
                <Text>{lifePlan.name}</Text>
                {lifePlan.description && (
                  <Text style={styles.description} numberOfLines={1}>
                    {lifePlan.description}
                  </Text>
                )}
              </DataTable.Cell>
              <DataTable.Cell>
                {formatDate(lifePlan.startYear, "yyyy")}
              </DataTable.Cell>
              <DataTable.Cell>{lifePlan.lifespan}年</DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => {
                      setSelectedLifePlan(lifePlan);
                      setEditModalVisible(true);
                    }}
                  />
                  <IconButton
                    icon="content-copy"
                    size={20}
                    onPress={() => handleCopy(lifePlan)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => {
                      setSelectedLifePlan(lifePlan);
                      setDeleteDialogVisible(true);
                    }}
                  />
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        {lifePlans.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              ライフプランが登録されていません
            </Text>
            <Button
              mode="contained"
              onPress={() => setCreateModalVisible(true)}
              style={styles.createButton}
            >
              ライフプランを作成
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        {/* 作成モーダル */}
        <LifePlanModal
          visible={isCreateModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          onSubmit={handleCreate}
          title="ライフプランの作成"
        />

        {/* 編集モーダル */}
        <LifePlanModal
          visible={isEditModalVisible}
          onDismiss={() => {
            setEditModalVisible(false);
            setSelectedLifePlan(null);
          }}
          onSubmit={handleUpdate}
          title="ライフプランの編集"
          initialValues={selectedLifePlan}
        />

        {/* 削除確認ダイアログ */}
        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setSelectedLifePlan(null);
          }}
          onConfirm={handleDelete}
          title="ライフプランの削除"
          message="このライフプランを削除してもよろしいですか？"
          confirmLabel="削除"
          confirmColor={COLORS.accent.error}
        />
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setCreateModalVisible(true)}
      />
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
  row: {
    minHeight: 60,
  },
  description: {
    fontSize: THEME.typography.caption,
    color: COLORS.grey[600],
    marginTop: THEME.spacing.xs,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyContainer: {
    padding: THEME.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
    marginBottom: THEME.spacing.md,
  },
  createButton: {
    marginTop: THEME.spacing.md,
  },
  fab: {
    position: "absolute",
    margin: THEME.spacing.md,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
