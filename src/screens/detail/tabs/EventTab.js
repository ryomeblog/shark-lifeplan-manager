import { observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, IconButton, Portal, Text, Title, useTheme } from 'react-native-paper';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS, THEME } from '../../../constants';
import { rootStore } from '../../../stores/RootStore';
import format from '../../../utils/format';
import EventModal from '../components/EventModal';

/**
 * イベントタブ
 */
const EventTab = observer(({ lifePlanId, yearData }) => {
  const theme = useTheme();

  // モーダルの表示状態
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  /**
   * イベントを日付順にソート
   */
  const sortedEvents = useMemo(() => {
    return [...yearData.events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [yearData.events]);

  /**
   * イベントの作成
   */
  const handleCreate = data => {
    rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
      events: [...yearData.events, { id: nanoid(), ...data }],
    });
    setModalVisible(false);
  };

  /**
   * イベントの更新
   */
  const handleUpdate = data => {
    if (editingEvent) {
      const updatedEvents = yearData.events.map(event =>
        event.id === editingEvent.id ? { ...event, ...data } : event,
      );
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        events: updatedEvents,
      });
      setModalVisible(false);
      setEditingEvent(null);
    }
  };

  /**
   * イベントの削除
   */
  const handleDelete = () => {
    if (editingEvent) {
      const updatedEvents = yearData.events.filter(event => event.id !== editingEvent.id);
      rootStore.lifePlanStore.updateYearlyFinance(lifePlanId, yearData.id, {
        events: updatedEvents,
      });
      setDeleteDialogVisible(false);
      setEditingEvent(null);
    }
  };

  /**
   * 関連する収支・資産データの取得
   */
  const getLinkedItems = impactDetails => {
    const items = {
      incomes: [],
      expenses: [],
      assets: [],
    };

    if (impactDetails.incomes) {
      items.incomes = yearData.incomes.filter(income => impactDetails.incomes.includes(income.id));
    }
    if (impactDetails.expenses) {
      items.expenses = yearData.expenses.filter(expense =>
        impactDetails.expenses.includes(expense.id),
      );
    }
    if (impactDetails.assets) {
      items.assets = yearData.assets.filter(asset => impactDetails.assets.includes(asset.id));
    }

    return items;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {sortedEvents.length > 0 ? (
          sortedEvents.map(event => {
            const linkedItems = getLinkedItems(event.impactDetails || {});

            return (
              <Card key={event.id} style={styles.eventCard}>
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Title>{event.name}</Title>
                      <Text style={styles.eventDate}>{format.formatDate(event.date)}</Text>
                    </View>
                    <View style={styles.actions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => {
                          setEditingEvent(event);
                          setModalVisible(true);
                        }}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => {
                          setEditingEvent(event);
                          setDeleteDialogVisible(true);
                        }}
                      />
                    </View>
                  </View>

                  {event.description && <Text style={styles.description}>{event.description}</Text>}

                  {/* 関連する収支・資産 */}
                  {(linkedItems.incomes.length > 0 ||
                    linkedItems.expenses.length > 0 ||
                    linkedItems.assets.length > 0) && (
                    <View style={styles.linkedItems}>
                      {linkedItems.incomes.length > 0 && (
                        <View style={styles.itemSection}>
                          <Text style={styles.sectionTitle}>関連する収入</Text>
                          {linkedItems.incomes.map(income => (
                            <Chip
                              key={income.id}
                              style={styles.itemChip}
                              textStyle={styles.chipText}>
                              {income.name}: {format.formatCurrency(income.amount)}
                            </Chip>
                          ))}
                        </View>
                      )}

                      {linkedItems.expenses.length > 0 && (
                        <View style={styles.itemSection}>
                          <Text style={styles.sectionTitle}>関連する支出</Text>
                          {linkedItems.expenses.map(expense => (
                            <Chip
                              key={expense.id}
                              style={styles.itemChip}
                              textStyle={styles.chipText}>
                              {expense.name}: {format.formatCurrency(expense.amount)}
                            </Chip>
                          ))}
                        </View>
                      )}

                      {linkedItems.assets.length > 0 && (
                        <View style={styles.itemSection}>
                          <Text style={styles.sectionTitle}>関連する資産</Text>
                          {linkedItems.assets.map(asset => (
                            <Chip
                              key={asset.id}
                              style={styles.itemChip}
                              textStyle={styles.chipText}>
                              {asset.name}: {format.formatCurrency(asset.initialAmount)}
                            </Chip>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>イベントが登録されていません</Text>
          </View>
        )}
      </ScrollView>

      {/* FABボタン */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />

      {/* モーダル */}
      <Portal>
        <EventModal
          visible={isModalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingEvent(null);
          }}
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          initialValues={editingEvent}
          yearData={yearData}
        />

        <ConfirmDialog
          visible={isDeleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setEditingEvent(null);
          }}
          onConfirm={handleDelete}
          title="イベントの削除"
          message={`${editingEvent?.name}を削除してもよろしいですか？`}
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
    padding: THEME.spacing.md,
  },
  eventCard: {
    marginBottom: THEME.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventDate: {
    fontSize: THEME.typography.body2,
    color: COLORS.grey[600],
    marginTop: THEME.spacing.xs,
  },
  description: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[700],
    marginTop: THEME.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
  },
  linkedItems: {
    marginTop: THEME.spacing.md,
  },
  itemSection: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.body2,
    color: COLORS.grey[600],
    marginBottom: THEME.spacing.xs,
  },
  itemChip: {
    marginRight: THEME.spacing.xs,
    marginBottom: THEME.spacing.xs,
    backgroundColor: COLORS.grey[100],
  },
  chipText: {
    fontSize: THEME.typography.caption,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  emptyText: {
    fontSize: THEME.typography.body1,
    color: COLORS.grey[600],
  },
  fab: {
    position: 'absolute',
    margin: THEME.spacing.md,
    right: 0,
    bottom: 0,
  },
});

export default EventTab;
