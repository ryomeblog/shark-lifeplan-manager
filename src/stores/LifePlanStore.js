import { makeAutoObservable, runInAction } from "mobx";
import { nanoid } from "nanoid";

/**
 * ライフプラン管理ストア
 */
export class LifePlanStore {
  lifePlans = new Map();
  activeLifePlanId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /**
   * 新規ライフプランの作成
   */
  createLifePlan(data) {
    const id = nanoid();
    runInAction(() => {
      this.lifePlans.set(id, {
        id,
        ...data,
        yearlyFinances: this.generateYearlyFinances(
          data.startYear,
          data.lifespan,
        ),
      });
      // 作成したライフプランをアクティブに
      this.activeLifePlanId = id;
    });
    return id;
  }

  /**
   * ライフプランの更新
   */
  updateLifePlan(id, data) {
    runInAction(() => {
      const lifePlan = this.lifePlans.get(id);
      if (lifePlan) {
        this.lifePlans.set(id, {
          ...lifePlan,
          ...data,
          yearlyFinances: this.generateYearlyFinances(
            data.startYear,
            data.lifespan,
          ),
        });
      }
    });
  }

  /**
   * ライフプランの削除
   */
  deleteLifePlan(id) {
    runInAction(() => {
      this.lifePlans.delete(id);
      if (this.activeLifePlanId === id) {
        this.activeLifePlanId = null;
      }
    });
  }

  /**
   * ライフプランのコピー
   */
  copyLifePlan(id) {
    const lifePlan = this.lifePlans.get(id);
    if (lifePlan) {
      const newId = this.createLifePlan({
        ...lifePlan,
        name: `${lifePlan.name} (コピー)`,
        id: undefined,
      });
      return newId;
    }
    return null;
  }

  /**
   * 年別財務情報の生成
   */
  generateYearlyFinances(startYear, lifespan) {
    const yearlyFinances = [];
    for (let i = 0; i < lifespan; i++) {
      yearlyFinances.push({
        id: nanoid(),
        year: startYear + i,
        events: [],
        incomes: [],
        expenses: [],
        assets: [],
      });
    }
    return yearlyFinances;
  }

  /**
   * 年別財務情報の更新
   */
  updateYearlyFinance(lifePlanId, yearlyFinanceId, data) {
    runInAction(() => {
      const lifePlan = this.lifePlans.get(lifePlanId);
      if (lifePlan) {
        const index = lifePlan.yearlyFinances.findIndex(
          (yf) => yf.id === yearlyFinanceId,
        );
        if (index !== -1) {
          lifePlan.yearlyFinances[index] = {
            ...lifePlan.yearlyFinances[index],
            ...data,
          };
        }
      }
    });
  }

  /**
   * 年別財務情報のクリア
   */
  clearYearlyFinance(lifePlanId, yearlyFinanceId) {
    runInAction(() => {
      const lifePlan = this.lifePlans.get(lifePlanId);
      if (lifePlan) {
        const index = lifePlan.yearlyFinances.findIndex(
          (yf) => yf.id === yearlyFinanceId,
        );
        if (index !== -1) {
          lifePlan.yearlyFinances[index] = {
            id: yearlyFinanceId,
            year: lifePlan.yearlyFinances[index].year,
            events: [],
            incomes: [],
            expenses: [],
            assets: [],
          };
        }
      }
    });
  }

  /**
   * 年別財務情報のコピー
   */
  copyYearlyFinance(lifePlanId, sourceYearId, targetYear) {
    runInAction(() => {
      const lifePlan = this.lifePlans.get(lifePlanId);
      if (lifePlan) {
        const sourceFinance = lifePlan.yearlyFinances.find(
          (yf) => yf.id === sourceYearId,
        );
        const targetFinance = lifePlan.yearlyFinances.find(
          (yf) => yf.year === targetYear,
        );

        if (sourceFinance && targetFinance) {
          targetFinance.events = sourceFinance.events.map((event) => ({
            ...event,
            id: nanoid(),
          }));
          targetFinance.incomes = sourceFinance.incomes.map((income) => ({
            ...income,
            id: nanoid(),
          }));
          targetFinance.expenses = sourceFinance.expenses.map((expense) => ({
            ...expense,
            id: nanoid(),
          }));
          targetFinance.assets = sourceFinance.assets.map((asset) => ({
            ...asset,
            id: nanoid(),
          }));
        }
      }
    });
  }

  /**
   * ストアデータのシリアライズ
   */
  serialize() {
    return Array.from(this.lifePlans.values());
  }

  /**
   * ストアデータの復元
   */
  hydrate(data) {
    runInAction(() => {
      this.lifePlans.clear();
      data.forEach((lifePlan) => {
        this.lifePlans.set(lifePlan.id, lifePlan);
      });
    });
  }

  /**
   * ストアのリセット
   */
  reset() {
    runInAction(() => {
      this.lifePlans.clear();
      this.activeLifePlanId = null;
    });
  }

  /**
   * 変更監視コールバックの設定
   */
  onChange(callback) {
    // MobXのreactionを使用して変更を監視
    return reaction(
      () => this.serialize(),
      () => callback(),
    );
  }

  // 計算済みプロパティ

  get activeLifePlan() {
    return this.lifePlans.get(this.activeLifePlanId);
  }

  get sortedLifePlans() {
    return Array.from(this.lifePlans.values()).sort(
      (a, b) => new Date(b.startYear) - new Date(a.startYear),
    );
  }
}
