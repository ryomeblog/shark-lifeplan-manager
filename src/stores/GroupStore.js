import { makeAutoObservable, reaction, runInAction } from "mobx";
import { nanoid } from "nanoid";

/**
 * グループ管理ストア
 * 収入・支出のグループを管理
 */
export class GroupStore {
  // グループマップ
  incomeGroups = new Map();
  expenseGroups = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.initializeDefaultGroups();
  }

  /**
   * デフォルトグループの初期化
   */
  initializeDefaultGroups() {
    // 収入グループのデフォルト値
    const defaultIncomeGroups = [
      {
        name: "給与基本グループ",
        items: [
          {
            id: nanoid(),
            name: "基本給",
            amount: 300000,
            frequency: "monthly",
            category: "給与収入",
            group: "給与基本グループ",
          },
          {
            id: nanoid(),
            name: "住宅手当",
            amount: 20000,
            frequency: "monthly",
            category: "給与収入",
            group: "給与基本グループ",
          },
        ],
      },
      {
        name: "賞与グループ",
        items: [
          {
            id: nanoid(),
            name: "夏季賞与",
            amount: 600000,
            frequency: "yearly",
            category: "給与収入",
            group: "賞与グループ",
            date: "2024-06-15",
          },
          {
            id: nanoid(),
            name: "冬季賞与",
            amount: 600000,
            frequency: "yearly",
            category: "給与収入",
            group: "賞与グループ",
            date: "2024-12-15",
          },
        ],
      },
    ];

    // 支出グループのデフォルト値
    const defaultExpenseGroups = [
      {
        name: "基本生活費グループ",
        items: [
          {
            id: nanoid(),
            name: "家賃",
            amount: 80000,
            frequency: "monthly",
            category: "固定費",
            group: "基本生活費グループ",
          },
          {
            id: nanoid(),
            name: "光熱費",
            amount: 15000,
            frequency: "monthly",
            category: "固定費",
            group: "基本生活費グループ",
          },
          {
            id: nanoid(),
            name: "通信費",
            amount: 10000,
            frequency: "monthly",
            category: "固定費",
            group: "基本生活費グループ",
          },
        ],
      },
      {
        name: "定期支出グループ",
        items: [
          {
            id: nanoid(),
            name: "生命保険料",
            amount: 20000,
            frequency: "monthly",
            category: "固定費",
            group: "定期支出グループ",
          },
          {
            id: nanoid(),
            name: "自動車保険料",
            amount: 60000,
            frequency: "yearly",
            category: "固定費",
            group: "定期支出グループ",
            date: "2024-04-01",
          },
        ],
      },
    ];

    // デフォルトグループの登録
    defaultIncomeGroups.forEach((group) => {
      this.createIncomeGroup(group);
    });
    defaultExpenseGroups.forEach((group) => {
      this.createExpenseGroup(group);
    });
  }

  /**
   * 収入グループの作成
   */
  createIncomeGroup(data) {
    const id = nanoid();
    runInAction(() => {
      this.incomeGroups.set(id, {
        id,
        name: data.name,
        items: data.items.map((item) => ({
          ...item,
          id: nanoid(),
        })),
      });
    });
    return id;
  }

  /**
   * 支出グループの作成
   */
  createExpenseGroup(data) {
    const id = nanoid();
    runInAction(() => {
      this.expenseGroups.set(id, {
        id,
        name: data.name,
        items: data.items.map((item) => ({
          ...item,
          id: nanoid(),
        })),
      });
    });
    return id;
  }

  /**
   * 収入グループの更新
   */
  updateIncomeGroup(id, data) {
    runInAction(() => {
      if (this.incomeGroups.has(id)) {
        const group = this.incomeGroups.get(id);
        this.incomeGroups.set(id, {
          ...group,
          name: data.name || group.name,
          items: data.items
            ? data.items.map((item) => ({
                ...item,
                id: item.id || nanoid(),
              }))
            : group.items,
        });
      }
    });
  }

  /**
   * 支出グループの更新
   */
  updateExpenseGroup(id, data) {
    runInAction(() => {
      if (this.expenseGroups.has(id)) {
        const group = this.expenseGroups.get(id);
        this.expenseGroups.set(id, {
          ...group,
          name: data.name || group.name,
          items: data.items
            ? data.items.map((item) => ({
                ...item,
                id: item.id || nanoid(),
              }))
            : group.items,
        });
      }
    });
  }

  /**
   * 収入グループの削除
   */
  deleteIncomeGroup(id) {
    runInAction(() => {
      this.incomeGroups.delete(id);
    });
  }

  /**
   * 支出グループの削除
   */
  deleteExpenseGroup(id) {
    runInAction(() => {
      this.expenseGroups.delete(id);
    });
  }

  /**
   * 収入グループへのアイテム追加
   */
  addIncomeGroupItem(groupId, item) {
    runInAction(() => {
      const group = this.incomeGroups.get(groupId);
      if (group) {
        group.items.push({
          ...item,
          id: nanoid(),
        });
      }
    });
  }

  /**
   * 支出グループへのアイテム追加
   */
  addExpenseGroupItem(groupId, item) {
    runInAction(() => {
      const group = this.expenseGroups.get(groupId);
      if (group) {
        group.items.push({
          ...item,
          id: nanoid(),
        });
      }
    });
  }

  /**
   * 収入グループからのアイテム削除
   */
  removeIncomeGroupItem(groupId, itemId) {
    runInAction(() => {
      const group = this.incomeGroups.get(groupId);
      if (group) {
        group.items = group.items.filter((item) => item.id !== itemId);
      }
    });
  }

  /**
   * 支出グループからのアイテム削除
   */
  removeExpenseGroupItem(groupId, itemId) {
    runInAction(() => {
      const group = this.expenseGroups.get(groupId);
      if (group) {
        group.items = group.items.filter((item) => item.id !== itemId);
      }
    });
  }

  /**
   * ストアデータのシリアライズ
   */
  serialize() {
    return {
      incomeGroups: Array.from(this.incomeGroups.values()),
      expenseGroups: Array.from(this.expenseGroups.values()),
    };
  }

  /**
   * ストアデータの復元
   */
  hydrate(data) {
    runInAction(() => {
      this.incomeGroups.clear();
      this.expenseGroups.clear();

      data.incomeGroups?.forEach((group) => {
        this.incomeGroups.set(group.id, group);
      });
      data.expenseGroups?.forEach((group) => {
        this.expenseGroups.set(group.id, group);
      });
    });
  }

  /**
   * ストアのリセット
   */
  reset() {
    runInAction(() => {
      this.incomeGroups.clear();
      this.expenseGroups.clear();
      this.initializeDefaultGroups();
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

  get sortedIncomeGroups() {
    return Array.from(this.incomeGroups.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  get sortedExpenseGroups() {
    return Array.from(this.expenseGroups.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
