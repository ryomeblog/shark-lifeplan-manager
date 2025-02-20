# シャークライフプランマネージャー 技術仕様書

## 1. レスポンシブデザイン実装仕様

### 1.1 ブレークポイント定義
```javascript
export const breakpoints = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024   // 1024px以上
};
```

### 1.2 レイアウト制御
```javascript
// レイアウトユーティリティ
export const getLayoutConfig = (width) => ({
  isDesktop: width >= breakpoints.desktop,
  isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
  isMobile: width < breakpoints.tablet,
  columns: width >= breakpoints.desktop ? 3 : (width >= breakpoints.tablet ? 2 : 1)
});

// 使用例
const ResponsiveLayout = ({ children }) => {
  const window = useWindowDimensions();
  const layout = getLayoutConfig(window.width);
  
  return (
    <View style={[
      styles.container,
      layout.isDesktop && styles.desktopContainer
    ]}>
      {children}
    </View>
  );
};
```

### 1.3 コンポーネントのレスポンシブ対応
```javascript
// テーブルコンポーネントの例
const ResponsiveTable = ({ data, columns }) => {
  const window = useWindowDimensions();
  const layout = getLayoutConfig(window.width);
  
  if (layout.isMobile) {
    return <CardList data={data} />;  // モバイル向けカードビュー
  }
  
  return <DataTable data={data} columns={columns} />;  // テーブルビュー
};
```

## 2. MobX状態管理設計

### 2.1 ルートストア設計
```javascript
class RootStore {
  constructor() {
    this.lifePlanStore = new LifePlanStore(this);
    this.categoryStore = new CategoryStore(this);
    this.groupStore = new GroupStore(this);
    this.assetStore = new AssetStore(this);
  }
  
  // ストア初期化
  async initialize() {
    await this.loadFromStorage();
    this.setupReactions();
  }
  
  // 永続化データ読み込み
  async loadFromStorage() {
    const data = await AsyncStorage.getItem('appData');
    if (data) {
      this.hydrateStores(JSON.parse(data));
    }
  }
  
  // 自動保存設定
  setupReactions() {
    reaction(
      () => this.serializedData,
      async (data) => {
        await AsyncStorage.setItem('appData', JSON.stringify(data));
      }
    );
  }
}
```

### 2.2 LifePlanストア設計
```javascript
class LifePlanStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  // 観測可能なデータ
  lifePlans = new Map();
  activeLifePlanId = null;
  
  // アクション
  @action
  createLifePlan(data) {
    const id = nanoid();
    const lifePlan = new LifePlan(id, data);
    this.lifePlans.set(id, lifePlan);
    return id;
  }
  
  // 計算プロパティ
  @computed
  get activeLifePlan() {
    return this.lifePlans.get(this.activeLifePlanId);
  }
  
  @computed
  get sortedLifePlans() {
    return Array.from(this.lifePlans.values())
      .sort((a, b) => b.startDate - a.startDate);
  }
}
```

## 3. データエクスポート/インポート実装

### 3.1 エクスポート処理
```javascript
class DataExporter {
  static async exportData(data) {
    try {
      // データをJSON文字列に変換
      const jsonString = JSON.stringify(data);
      
      // gzip圧縮
      const compressed = pako.gzip(jsonString);
      
      // Base64エンコード
      const base64String = base64.encode(compressed);
      
      return base64String;
      
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  }
}
```

### 3.2 インポート処理
```javascript
class DataImporter {
  static async importData(base64String) {
    try {
      // Base64デコード
      const compressed = base64.decode(base64String);
      
      // gzip解凍
      const jsonString = pako.ungzip(compressed, { to: 'string' });
      
      // JSONパース
      const data = JSON.parse(jsonString);
      
      // データ検証
      if (!this.validateImportData(data)) {
        throw new Error('不正なデータ形式です');
      }
      
      return data;
      
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('データのインポートに失敗しました');
    }
  }
  
  static validateImportData(data) {
    // データ構造の検証ロジック
    return true;
  }
}
```

## 4. 資産計算エンジン実装

### 4.1 資産計算マネージャー
```javascript
class AssetCalculationManager {
  constructor(assetData) {
    this.assetData = assetData;
  }
  
  // 年次パフォーマンス計算
  calculateYearlyPerformance(year) {
    const yearStartDate = new Date(year, 0, 1);
    const yearEndDate = new Date(year, 11, 31);
    
    const capitalGainResult = this.calculateCapitalGain(yearStartDate, yearEndDate);
    const incomeGainResult = this.calculateIncomeGain(yearStartDate, yearEndDate);
    
    return {
      year,
      startValue: capitalGainResult.startValue,
      endValue: capitalGainResult.endValue,
      capitalGains: capitalGainResult.gains,
      totalDividends: incomeGainResult.totalDividends,
      dividends: incomeGainResult.dividends
    };
  }
  
  // 複数年のパフォーマンス予測
  predictPerformance(startYear, endYear) {
    const results = [];
    let currentValue = this.assetData.initialAmount;
    
    for (let year = startYear; year <= endYear; year++) {
      const yearPerformance = this.calculateYearlyPerformance(year);
      results.push(yearPerformance);
      currentValue = yearPerformance.endValue;
    }
    
    return results;
  }
}
```

### 4.2 税金計算エンジン
```javascript
class TaxCalculator {
  // 給与所得の源泉徴収額計算
  calculateWithholdingTax(salary, dependents = 0) {
    // 給与所得控除
    const deduction = this.calculateSalaryDeduction(salary);
    
    // 配偶者控除・扶養控除
    const personalDeductions = this.calculatePersonalDeductions(dependents);
    
    // 課税所得
    const taxableIncome = Math.max(salary - deduction - personalDeductions, 0);
    
    // 税率適用
    return this.calculateProgressiveTax(taxableIncome);
  }
  
  // 投資収益の税金計算
  calculateInvestmentTax(capitalGains, dividends) {
    const taxableAmount = capitalGains + dividends;
    const taxRate = 0.20315; // 約20.315%（所得税+住民税）
    
    return Math.floor(taxableAmount * taxRate);
  }
}
```

### 4.3 資産予測シミュレーション
```javascript
class AssetSimulator {
  constructor(assets, inflation = 0.02) {
    this.assets = assets;
    this.inflation = inflation;
  }
  
  // モンテカルロシミュレーション
  runMonteCarloSimulation(years, iterations = 1000) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const simulation = this.simulateSinglePath(years);
      results.push(simulation);
    }
    
    return {
      bestCase: this.calculatePercentile(results, 0.95),
      expected: this.calculatePercentile(results, 0.50),
      worstCase: this.calculatePercentile(results, 0.05)
    };
  }
  
  // 期待値の信頼区間計算
  calculateConfidenceInterval(simResults, confidence = 0.95) {
    const sorted = simResults.sort((a, b) => a - b);
    const lower = sorted[Math.floor(sorted.length * (1 - confidence) / 2)];
    const upper = sorted[Math.floor(sorted.length * (1 + confidence) / 2)];
    
    return { lower, upper };
  }
}
```

## 5. パフォーマンス最適化実装

### 5.1 リスト最適化
```javascript
// 仮想化リストコンポーネント
const VirtualizedList = ({ data, renderItem }) => {
  const renderItemMemoized = useCallback(({ item }) => {
    return renderItem(item);
  }, [renderItem]);
  
  return (
    <FlatList
      data={data}
      renderItem={renderItemMemoized}
      keyExtractor={item => item.id}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};
```

### 5.2 計算キャッシュ
```javascript
class CalculationCache {
  constructor() {
    this.cache = new Map();
  }
  
  // メモ化された計算実行
  memoizedCalculate(key, calculation) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = calculation();
    this.cache.set(key, result);
    return result;
  }
  
  // キャッシュ更新判定
  shouldInvalidateCache(dependencies) {
    return dependencies.some(dep => this.hasChanged(dep));
  }
}
```

## 6. セキュリティ実装

### 6.1 データ暗号化
```javascript
class DataEncryption {
  static async encryptData(data, password) {
    const salt = crypto.randomBytes(16);
    const key = await this.deriveKey(password, salt);
    const iv = crypto.randomBytes(12);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return {
      encrypted,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64')
    };
  }
  
  static async decryptData(encryptedData, password) {
    const { encrypted, salt, iv, tag } = encryptedData;
    const key = await this.deriveKey(password, Buffer.from(salt, 'base64'));
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

### 6.2 入力検証
```javascript
class InputValidator {
  static validateNumber(value, { min, max, integer = false } = {}) {
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
    
    if (integer && !Number.isInteger(value)) {
      return false;
    }
    
    if (min !== undefined && value < min) {
      return false;
    }
    
    if (max !== undefined && value > max) {
      return false;
    }
    
    return true;
  }
  
  static sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // HTMLタグ除去
      .trim();
  }
}
```

## 7. エラーハンドリング実装

### 7.1 エラー管理
```javascript
class ErrorManager {
  static handleError(error, context = {}) {
    // エラーログ記録
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context
    });
    
    // エラー種別の判定
    if (error instanceof ValidationError) {
      return this.handleValidationError(error);
    }
    
    if (error instanceof StorageError) {
      return this.handleStorageError(error);
    }
    
    // 予期せぬエラー
    return {
      type: 'UNEXPECTED_ERROR',
      message: '予期せぬエラーが発生しました。'
    };
  }
  
  static showErrorToast(message) {
    Toast.show({
      type: 'error',
      text1: 'エラー',
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true
    });
  }
}
```

### 7.2 エラーバウンダリ
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // エラーログ送信
    ErrorManager.handleError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            申し訳ありません。エラーが発生しました。
          </Text>
          <Button
            mode="contained"
            onPress={() => this.setState({ hasError: false })}
          >
            再読み込み
          </Button>
        </View>
      );
    }
    
    return this.props.children;
  }
}