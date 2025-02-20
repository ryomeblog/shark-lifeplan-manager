import { makeAutoObservable, reaction, runInAction } from "mobx";
import { nanoid } from "nanoid";

/**
 * 資産管理ストア
 * 資産情報の管理、評価額計算、パフォーマンス追跡を行う
 */
export class AssetStore {
  // 資産マップ
  assets = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /**
   * 資産の作成
   */
  createAsset(data) {
    const id = nanoid();
    const asset = {
      id,
      ...data,
      yearlyPerformance: this.initializeYearlyPerformance(
        data.startDate,
        data.maturityDate,
        data.initialAmount,
        data.returns,
      ),
    };

    runInAction(() => {
      this.assets.set(id, asset);
    });
    return id;
  }

  /**
   * 年次パフォーマンスの初期化
   */
  initializeYearlyPerformance(startDate, maturityDate, initialAmount, returns) {
    const startYear = new Date(startDate).getFullYear();
    const endYear = maturityDate
      ? new Date(maturityDate).getFullYear()
      : startYear + 50;
    const yearlyPerformance = [];

    let currentAmount = initialAmount;
    for (let year = startYear; year <= endYear; year++) {
      const performance = this.calculateYearPerformance(
        year,
        currentAmount,
        returns,
      );
      yearlyPerformance.push(performance);
      currentAmount = performance.endValue;
    }

    return yearlyPerformance;
  }

  /**
   * 年間パフォーマンスの計算
   */
  calculateYearPerformance(year, startValue, returns) {
    const {
      capitalGain: { annualRate, compoundingFrequency },
      incomeGain: { dividendYield, paymentFrequency, reinvestDividends },
    } = returns;

    // キャピタルゲインの計算
    const capitalGainResult = this.calculateCapitalGain(
      startValue,
      annualRate,
      compoundingFrequency,
    );

    // インカムゲインの計算
    const dividends = this.calculateDividends(
      startValue,
      dividendYield,
      paymentFrequency,
      year,
    );

    const totalDividends = dividends.reduce((sum, div) => sum + div.amount, 0);
    const endValue = reinvestDividends
      ? capitalGainResult.evaluationAmount + totalDividends
      : capitalGainResult.evaluationAmount;

    return {
      year,
      startValue: Math.round(startValue),
      endValue: Math.round(endValue),
      capitalGains: Math.round(capitalGainResult.capitalGain),
      dividends,
      totalDividends: Math.round(totalDividends),
    };
  }

  /**
   * キャピタルゲインの計算
   */
  calculateCapitalGain(initialAmount, annualRate, compoundingFrequency) {
    let periods;
    let rate;

    switch (compoundingFrequency) {
      case "daily":
        periods = 365;
        rate = annualRate / 365;
        break;
      case "monthly":
        periods = 12;
        rate = annualRate / 12;
        break;
      case "yearly":
      default:
        periods = 1;
        rate = annualRate;
        break;
    }

    const finalAmount = initialAmount * Math.pow(1 + rate, periods);

    return {
      evaluationAmount: finalAmount,
      capitalGain: finalAmount - initialAmount,
    };
  }

  /**
   * 配当の計算
   */
  calculateDividends(amount, dividendYield, paymentFrequency, year) {
    const dividends = [];
    let paymentsPerYear;

    switch (paymentFrequency) {
      case "monthly":
        paymentsPerYear = 12;
        break;
      case "quarterly":
        paymentsPerYear = 4;
        break;
      case "yearly":
      default:
        paymentsPerYear = 1;
        break;
    }

    const dividendPerPayment = (amount * dividendYield) / paymentsPerYear;

    for (let i = 0; i < paymentsPerYear; i++) {
      const month = Math.floor((12 / paymentsPerYear) * i);
      dividends.push({
        date: new Date(year, month, 1).toISOString().split("T")[0],
        amount: Math.round(dividendPerPayment),
      });
    }

    return dividends;
  }

  /**
   * 資産の更新
   */
  updateAsset(id, data) {
    runInAction(() => {
      if (this.assets.has(id)) {
        const asset = this.assets.get(id);
        const updatedAsset = {
          ...asset,
          ...data,
        };

        // 評価額に影響する項目が更新された場合、パフォーマンスを再計算
        if (
          data.initialAmount !== undefined ||
          data.returns !== undefined ||
          data.startDate !== undefined ||
          data.maturityDate !== undefined
        ) {
          updatedAsset.yearlyPerformance = this.initializeYearlyPerformance(
            updatedAsset.startDate,
            updatedAsset.maturityDate,
            updatedAsset.initialAmount,
            updatedAsset.returns,
          );
        }

        this.assets.set(id, updatedAsset);
      }
    });
  }

  /**
   * 資産の削除
   */
  deleteAsset(id) {
    runInAction(() => {
      this.assets.delete(id);
    });
  }

  /**
   * 実績値の更新
   */
  updateActualPerformance(id, year, actualData) {
    runInAction(() => {
      const asset = this.assets.get(id);
      if (asset) {
        const performanceIndex = asset.yearlyPerformance.findIndex(
          (p) => p.year === year,
        );
        if (performanceIndex !== -1) {
          asset.yearlyPerformance[performanceIndex] = {
            ...asset.yearlyPerformance[performanceIndex],
            actualEndValue: actualData.endValue,
            actualCapitalGains: actualData.capitalGains,
            actualDividends: actualData.dividends,
            actualTotalDividends: actualData.totalDividends,
          };
        }
      }
    });
  }

  /**
   * モンテカルロシミュレーションの実行
   */
  runMonteCarloSimulation(assetId, years, iterations = 1000) {
    const asset = this.assets.get(assetId);
    if (!asset) return null;

    const results = [];
    const { annualRate } = asset.returns.capitalGain;
    const volatility = 0.15; // 変動率（実際のデータに基づいて調整可能）

    for (let i = 0; i < iterations; i++) {
      let value = asset.initialAmount;
      const path = [value];

      for (let year = 1; year <= years; year++) {
        // 対数正規分布を使用してランダムなリターンを生成
        const randomReturn =
          Math.exp(
            annualRate -
              0.5 * volatility * volatility +
              volatility * this.normalRandom(),
          ) - 1;

        value *= 1 + randomReturn;
        path.push(value);
      }
      results.push(path);
    }

    // パーセンタイルの計算
    const finalValues = results.map((path) => path[path.length - 1]);
    finalValues.sort((a, b) => a - b);

    return {
      bestCase: this.getPercentile(finalValues, 0.95),
      expected: this.getPercentile(finalValues, 0.5),
      worstCase: this.getPercentile(finalValues, 0.05),
      paths: results,
    };
  }

  /**
   * 標準正規分布の乱数生成（Box-Muller変換）
   */
  normalRandom() {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * パーセンタイルの取得
   */
  getPercentile(sortedArray, percentile) {
    const index = Math.floor(sortedArray.length * percentile);
    return sortedArray[index];
  }

  /**
   * ストアデータのシリアライズ
   */
  serialize() {
    return Array.from(this.assets.values());
  }

  /**
   * ストアデータの復元
   */
  hydrate(data) {
    runInAction(() => {
      this.assets.clear();
      data.forEach((asset) => {
        this.assets.set(asset.id, asset);
      });
    });
  }

  /**
   * ストアのリセット
   */
  reset() {
    runInAction(() => {
      this.assets.clear();
    });
  }

  /**
   * 変更監視コールバックの設定
   */
  onChange(callback) {
    return reaction(
      () => this.serialize(),
      () => callback(),
    );
  }

  // 計算済みプロパティ

  get sortedAssets() {
    return Array.from(this.assets.values()).sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate),
    );
  }

  get totalAssetValue() {
    return Array.from(this.assets.values()).reduce((total, asset) => {
      const latestPerformance =
        asset.yearlyPerformance[asset.yearlyPerformance.length - 1];
      return (
        total + (latestPerformance.actualEndValue || latestPerformance.endValue)
      );
    }, 0);
  }
}
