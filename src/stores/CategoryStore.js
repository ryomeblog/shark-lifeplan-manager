import { makeAutoObservable, reaction, runInAction } from "mobx";
import { nanoid } from "nanoid";

/**
 * カテゴリ管理ストア
 * 収入・支出・資産のカテゴリを管理
 */
export class CategoryStore {
  // カテゴリマップ
  incomeCategories = new Map();
  expenseCategories = new Map();
  assetCategories = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.initializeDefaultCategories();
  }

  /**
   * デフォルトカテゴリの初期化
   */
  initializeDefaultCategories() {
    // 収入カテゴリのデフォルト値
    const defaultIncomeCategories = [
      { name: "給与収入", description: "定期的な給与収入", color: "#4CAF50" },
      { name: "事業収入", description: "事業活動からの収入", color: "#2196F3" },
      { name: "投資収入", description: "投資からの収入", color: "#9C27B0" },
      { name: "その他収入", description: "その他の収入", color: "#607D8B" },
    ];

    // 支出カテゴリのデフォルト値
    const defaultExpenseCategories = [
      { name: "固定費", description: "定期的な固定支出", color: "#F44336" },
      { name: "変動費", description: "変動する支出", color: "#FF9800" },
      { name: "教育費", description: "教育関連の支出", color: "#009688" },
      { name: "その他支出", description: "その他の支出", color: "#795548" },
    ];

    // 資産カテゴリのデフォルト値
    const defaultAssetCategories = [
      { name: "預貯金", description: "銀行預金や現金", color: "#3F51B5" },
      { name: "投資", description: "株式や投資信託", color: "#E91E63" },
      { name: "不動産", description: "不動産資産", color: "#FFC107" },
      { name: "その他資産", description: "その他の資産", color: "#9E9E9E" },
    ];

    // デフォルトカテゴリの登録
    defaultIncomeCategories.forEach((category) => {
      this.createIncomeCategory(category);
    });
    defaultExpenseCategories.forEach((category) => {
      this.createExpenseCategory(category);
    });
    defaultAssetCategories.forEach((category) => {
      this.createAssetCategory(category);
    });
  }

  /**
   * 収入カテゴリの作成
   */
  createIncomeCategory(data) {
    const id = nanoid();
    runInAction(() => {
      this.incomeCategories.set(id, { id, ...data });
    });
    return id;
  }

  /**
   * 支出カテゴリの作成
   */
  createExpenseCategory(data) {
    const id = nanoid();
    runInAction(() => {
      this.expenseCategories.set(id, { id, ...data });
    });
    return id;
  }

  /**
   * 資産カテゴリの作成
   */
  createAssetCategory(data) {
    const id = nanoid();
    runInAction(() => {
      this.assetCategories.set(id, { id, ...data });
    });
    return id;
  }

  /**
   * 収入カテゴリの更新
   */
  updateIncomeCategory(id, data) {
    runInAction(() => {
      if (this.incomeCategories.has(id)) {
        this.incomeCategories.set(id, {
          ...this.incomeCategories.get(id),
          ...data,
        });
      }
    });
  }

  /**
   * 支出カテゴリの更新
   */
  updateExpenseCategory(id, data) {
    runInAction(() => {
      if (this.expenseCategories.has(id)) {
        this.expenseCategories.set(id, {
          ...this.expenseCategories.get(id),
          ...data,
        });
      }
    });
  }

  /**
   * 資産カテゴリの更新
   */
  updateAssetCategory(id, data) {
    runInAction(() => {
      if (this.assetCategories.has(id)) {
        this.assetCategories.set(id, {
          ...this.assetCategories.get(id),
          ...data,
        });
      }
    });
  }

  /**
   * 収入カテゴリの削除
   */
  deleteIncomeCategory(id) {
    runInAction(() => {
      this.incomeCategories.delete(id);
    });
  }

  /**
   * 支出カテゴリの削除
   */
  deleteExpenseCategory(id) {
    runInAction(() => {
      this.expenseCategories.delete(id);
    });
  }

  /**
   * 資産カテゴリの削除
   */
  deleteAssetCategory(id) {
    runInAction(() => {
      this.assetCategories.delete(id);
    });
  }

  /**
   * ストアデータのシリアライズ
   */
  serialize() {
    return {
      incomeCategories: Array.from(this.incomeCategories.values()),
      expenseCategories: Array.from(this.expenseCategories.values()),
      assetCategories: Array.from(this.assetCategories.values()),
    };
  }

  /**
   * ストアデータの復元
   */
  hydrate(data) {
    runInAction(() => {
      this.incomeCategories.clear();
      this.expenseCategories.clear();
      this.assetCategories.clear();

      data.incomeCategories?.forEach((category) => {
        this.incomeCategories.set(category.id, category);
      });
      data.expenseCategories?.forEach((category) => {
        this.expenseCategories.set(category.id, category);
      });
      data.assetCategories?.forEach((category) => {
        this.assetCategories.set(category.id, category);
      });
    });
  }

  /**
   * ストアのリセット
   */
  reset() {
    runInAction(() => {
      this.incomeCategories.clear();
      this.expenseCategories.clear();
      this.assetCategories.clear();
      this.initializeDefaultCategories();
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

  get sortedIncomeCategories() {
    return Array.from(this.incomeCategories.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  get sortedExpenseCategories() {
    return Array.from(this.expenseCategories.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  get sortedAssetCategories() {
    return Array.from(this.assetCategories.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
