import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Modal, Portal, Text } from 'react-native-paper';
import DatePickerInput from '../../../components/forms/DatePickerInput';
import NumberInput from '../../../components/forms/NumberInput';
import TextInput from '../../../components/forms/TextInput';
import { COLORS, ENUMS, THEME } from '../../../constants';
import { rootStore } from '../../../stores/RootStore';
import { logModalShow } from '../../../utils/logger';

/**
 * 資産作成・編集モーダル
 */
const AssetModal = observer(({ visible, onDismiss, onSubmit, initialValues, year }) => {
  // 基本情報の状態
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [maturityDate, setMaturityDate] = useState(null);

  // キャピタルゲイン設定の状態
  const [annualRate, setAnnualRate] = useState(0.05); // デフォルト5%
  const [compoundingFrequency, setCompoundingFrequency] = useState(
    ENUMS.compoundingFrequency.MONTHLY,
  );

  // インカムゲイン設定の状態
  const [dividendYield, setDividendYield] = useState(0.02); // デフォルト2%
  const [paymentFrequency, setPaymentFrequency] = useState('quarterly');
  const [reinvestDividends, setReinvestDividends] = useState(true);

  // 実績値の状態
  const [actualEndValue, setActualEndValue] = useState(0);
  const [actualCapitalGains, setActualCapitalGains] = useState(0);
  const [actualDividends, setActualDividends] = useState([]);

  const [error, setError] = useState(null);

  // カテゴリのデータ
  const categories = rootStore.categoryStore.sortedAssetCategories;

  // 初期値のセット
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setInitialAmount(initialValues.initialAmount);
      setCategory(initialValues.category);
      setStartDate(initialValues.startDate);
      setMaturityDate(initialValues.maturityDate);

      if (initialValues.returns) {
        const { capitalGain, incomeGain } = initialValues.returns;
        setAnnualRate(capitalGain.annualRate);
        setCompoundingFrequency(capitalGain.compoundingFrequency);
        setDividendYield(incomeGain?.dividendYield || 0.02);
        setPaymentFrequency(incomeGain?.paymentFrequency || 'quarterly');
        setReinvestDividends(incomeGain?.reinvestDividends || true);
      }

      const yearPerformance = initialValues.yearlyPerformance?.find(p => p.year === year);
      if (yearPerformance) {
        setActualEndValue(yearPerformance.actualEndValue || yearPerformance.endValue);
        setActualCapitalGains(yearPerformance.actualCapitalGains || yearPerformance.capitalGains);
        setActualDividends(yearPerformance.actualDividends || yearPerformance.dividends);
      }
    }
  }, [initialValues, year]);

  /**
   * フォームの検証
   */
  const validateForm = () => {
    if (!name.trim()) {
      setError('資産名を入力してください');
      return false;
    }
    if (initialAmount <= 0) {
      setError('初期投資額を入力してください');
      return false;
    }
    if (!category) {
      setError('カテゴリを選択してください');
      return false;
    }
    if (!startDate) {
      setError('投資開始日を選択してください');
      return false;
    }
    if (maturityDate && new Date(maturityDate) <= new Date(startDate)) {
      setError('満期日は開始日より後の日付を選択してください');
      return false;
    }
    return true;
  };

  /**
   * 送信処理
   */
  const handleSubmit = () => {
    if (validateForm()) {
      const data = {
        name: name.trim(),
        initialAmount,
        category,
        startDate,
        maturityDate,
        returns: {
          capitalGain: {
            annualRate,
            compoundingFrequency,
          },
          incomeGain: {
            dividendYield,
            paymentFrequency,
            reinvestDividends,
          },
        },
      };

      // 実績値がある場合は年次パフォーマンスに追加
      if (actualEndValue || actualCapitalGains || actualDividends.length > 0) {
        data.yearlyPerformance = [
          {
            year,
            actualEndValue,
            actualCapitalGains,
            actualDividends,
          },
        ];
      }

      onSubmit(data);
      resetForm();
    }
  };

  /**
   * フォームのリセット
   */
  const resetForm = () => {
    setName('');
    setInitialAmount(0);
    setCategory('');
    setStartDate(null);
    setMaturityDate(null);
    setAnnualRate(0.05);
    setCompoundingFrequency(ENUMS.compoundingFrequency.MONTHLY);
    setDividendYield(0.02);
    setPaymentFrequency('quarterly');
    setReinvestDividends(true);
    setActualEndValue(0);
    setActualCapitalGains(0);
    setActualDividends([]);
    setError(null);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        onShow={() => logModalShow('資産モーダル')}
        contentContainerStyle={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{initialValues ? '資産の編集' : '資産の追加'}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* 基本情報フォーム */}
          <List.Section title="基本情報">
            <TextInput
              label="資産名"
              defaultValue={name}
              onChangeText={setName}
              style={styles.input}
            />
            <NumberInput
              label="初期投資額"
              defaultValue={initialAmount}
              onChangeValue={setInitialAmount}
              format="currency"
              style={styles.input}
            />
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
            <DatePickerInput
              label="投資開始日"
              value={startDate}
              onChange={setStartDate}
              style={styles.input}
            />
            <DatePickerInput
              label="満期日（任意）"
              value={maturityDate}
              onChange={setMaturityDate}
              style={styles.input}
            />
          </List.Section>

          {/* キャピタルゲイン設定 */}
          <List.Section title="キャピタルゲイン設定">
            <NumberInput
              label="年間期待収益率"
              defaultValue={annualRate}
              onChangeValue={setAnnualRate}
              step={0.001}
              format="percent"
              style={styles.input}
            />
            <List.Accordion
              title="複利計算頻度"
              description={compoundingFrequency}
              style={styles.input}>
              <List.Item
                title="年次"
                onPress={() => setCompoundingFrequency(ENUMS.compoundingFrequency.YEARLY)}
              />
              <List.Item
                title="月次"
                onPress={() => setCompoundingFrequency(ENUMS.compoundingFrequency.MONTHLY)}
              />
              <List.Item
                title="日次"
                onPress={() => setCompoundingFrequency(ENUMS.compoundingFrequency.DAILY)}
              />
            </List.Accordion>
          </List.Section>

          {/* インカムゲイン設定 */}
          <List.Section title="インカムゲイン設定">
            <NumberInput
              label="予想配当利回り"
              defaultValue={dividendYield}
              onChangeValue={setDividendYield}
              step={0.001}
              format="percent"
              style={styles.input}
            />
            <List.Accordion
              title="配当支払頻度"
              description={paymentFrequency}
              style={styles.input}>
              <List.Item title="年次" onPress={() => setPaymentFrequency('yearly')} />
              <List.Item title="四半期" onPress={() => setPaymentFrequency('quarterly')} />
              <List.Item title="月次" onPress={() => setPaymentFrequency('monthly')} />
            </List.Accordion>
            <List.Item
              title="配当金の再投資"
              right={() => (
                <Button
                  mode={reinvestDividends ? 'contained' : 'outlined'}
                  onPress={() => setReinvestDividends(!reinvestDividends)}>
                  {reinvestDividends ? 'ON' : 'OFF'}
                </Button>
              )}
            />
          </List.Section>

          {/* 実績値入力 */}
          <List.Section title="実績値入力">
            <NumberInput
              label="期末評価額"
              defaultValue={actualEndValue}
              onChangeValue={setActualEndValue}
              format="currency"
              style={styles.input}
            />
            <NumberInput
              label="キャピタルゲイン"
              defaultValue={actualCapitalGains}
              onChangeValue={setActualCapitalGains}
              format="currency"
              style={styles.input}
            />
            <Button
              mode="outlined"
              onPress={() => {
                setActualDividends([
                  ...actualDividends,
                  { date: new Date().toISOString(), amount: 0 },
                ]);
              }}
              style={styles.addDividendButton}>
              配当実績を追加
            </Button>
            {actualDividends.map((dividend, index) => (
              <View key={index} style={styles.dividendRow}>
                <DatePickerInput
                  label="配当日"
                  value={dividend.date}
                  onChange={date => {
                    const updated = [...actualDividends];
                    updated[index] = { ...dividend, date };
                    setActualDividends(updated);
                  }}
                  style={styles.dividendDate}
                />
                <NumberInput
                  label="配当金額"
                  defaultValue={dividend.amount}
                  onChangeValue={amount => {
                    const updated = [...actualDividends];
                    updated[index] = { ...dividend, amount };
                    setActualDividends(updated);
                  }}
                  format="currency"
                  style={styles.dividendAmount}
                />
                <Button
                  icon="delete"
                  mode="text"
                  onPress={() => {
                    const updated = actualDividends.filter((_, i) => i !== index);
                    setActualDividends(updated);
                  }}
                />
              </View>
            ))}
          </List.Section>

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
  input: {
    marginBottom: THEME.spacing.md,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: THEME.spacing.sm,
  },
  addDividendButton: {
    marginBottom: THEME.spacing.md,
  },
  dividendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  dividendDate: {
    flex: 2,
    marginRight: THEME.spacing.sm,
  },
  dividendAmount: {
    flex: 1,
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

export default AssetModal;
