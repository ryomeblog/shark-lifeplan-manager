import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { TabBar, TabBarItem, TabView } from 'react-native-tab-view';
import { COLORS, THEME } from '../../constants';
import { rootStore } from '../../stores/RootStore';

// タブコンポーネントのインポート
import AssetTab from './tabs/AssetTab';
import EventTab from './tabs/EventTab';
import ExpenseTab from './tabs/ExpenseTab';
import IncomeTab from './tabs/IncomeTab';

/**
 * 収支イベント資産管理画面
 */
const DetailScreen = observer(({ route, navigation }) => {
  const theme = useTheme();
  const { lifePlanId, yearId, year } = route.params;

  useEffect(() => {
    console.log(
      `DetailScreen: 画面がマウントされました (LifePlanId: ${lifePlanId}, YearId: ${yearId}, Year: ${year})`,
    );
    return () => {
      console.log(
        `DetailScreen: 画面がアンマウントされました (LifePlanId: ${lifePlanId}, YearId: ${yearId}, Year: ${year})`,
      );
    };
  }, [lifePlanId, yearId, year]);

  // 画面のタイトルを設定
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${year}年の収支・資産管理`,
    });
  }, [navigation, year]);

  // タブの状態管理
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'expense', title: '支出' },
    { key: 'income', title: '収入' },
    { key: 'asset', title: '資産' },
    { key: 'event', title: 'イベント' },
  ]);

  // ライフプランと年別データの取得
  const lifePlan = rootStore.lifePlanStore.lifePlans.get(lifePlanId);
  const yearData = lifePlan?.yearlyFinances.find(yf => yf.id === yearId);

  if (!lifePlan || !yearData) {
    return (
      <View style={styles.centerContainer}>
        <Text>データが見つかりません</Text>
      </View>
    );
  }

  /**
   * タブのレンダリング
   */
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'expense':
        return <ExpenseTab lifePlanId={lifePlanId} yearData={yearData} />;
      case 'income':
        return <IncomeTab lifePlanId={lifePlanId} yearData={yearData} />;
      case 'asset':
        return <AssetTab lifePlanId={lifePlanId} yearData={yearData} />;
      case 'event':
        return <EventTab lifePlanId={lifePlanId} yearData={yearData} />;
      default:
        return null;
    }
  };

  /**
   * タブバーのレンダリング
   */
  const renderTabBarItem = props => {
    const { key, ...rest } = props;
    return <TabBarItem key={key} {...rest} />;
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: COLORS.common.white }}
      labelStyle={styles.tabLabel}
      renderTabBarItem={renderTabBarItem}
      activeColor={theme.colors.primary}
      inactiveColor={COLORS.grey[600]}
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        style={styles.tabView}
      />
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
  tabView: {
    flex: 1,
  },
  tabLabel: {
    fontSize: THEME.typography.body2,
    fontWeight: 'bold',
    textTransform: 'none',
  },
});

export default DetailScreen;
