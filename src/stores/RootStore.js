import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeAutoObservable, reaction } from "mobx";
import { AssetStore } from "./AssetStore";
import { CategoryStore } from "./CategoryStore";
import { GroupStore } from "./GroupStore";
import { LifePlanStore } from "./LifePlanStore";

/**
 * アプリケーションのルートストア
 * すべてのストアを管理し、永続化を担当
 */
export class RootStore {
  constructor() {
    this.lifePlanStore = new LifePlanStore(this);
    this.categoryStore = new CategoryStore(this);
    this.groupStore = new GroupStore(this);
    this.assetStore = new AssetStore(this);

    makeAutoObservable(this);
  }

  /**
   * ストアの初期化
   */
  async initialize() {
    try {
      await this.loadFromStorage();
      this.setupReactions();
      return true;
    } catch (error) {
      console.error("ストアの初期化に失敗しました:", error);
      return false;
    }
  }

  /**
   * AsyncStorageからデータを読み込み
   */
  async loadFromStorage() {
    try {
      const storageData = await AsyncStorage.getItem("appData");
      if (storageData) {
        const data = JSON.parse(storageData);
        this.hydrateStores(data);
      }
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
      throw error;
    }
  }

  /**
   * AsyncStorageにデータを保存
   */
  async saveToStorage() {
    try {
      const data = {
        lifePlans: this.lifePlanStore.serialize(),
        categories: this.categoryStore.serialize(),
        groups: this.groupStore.serialize(),
        assets: this.assetStore.serialize(),
      };
      await AsyncStorage.setItem("appData", JSON.stringify(data));
    } catch (error) {
      console.error("データの保存に失敗しました:", error);
      throw error;
    }
  }

  /**
   * ストアのデータを復元
   */
  hydrateStores(data) {
    if (data.lifePlans) {
      this.lifePlanStore.hydrate(data.lifePlans);
    }
    if (data.categories) {
      this.categoryStore.hydrate(data.categories);
    }
    if (data.groups) {
      this.groupStore.hydrate(data.groups);
    }
    if (data.assets) {
      this.assetStore.hydrate(data.assets);
    }
  }

  /**
   * データの永続化を設定
   */
  setupReactions() {
    // データ変更時に自動保存（デバウンス付き）
    let saveTimeout;
    const debouncedSave = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(() => this.saveToStorage(), 1000);
    };

    // 各ストアの変更を監視
    reaction(
      () => ({
        lifePlans: this.lifePlanStore.serialize(),
        categories: this.categoryStore.serialize(),
        groups: this.groupStore.serialize(),
        assets: this.assetStore.serialize(),
      }),
      () => debouncedSave(),
    );
  }

  /**
   * アプリケーションデータのエクスポート
   */
  async exportData() {
    try {
      const data = {
        lifePlans: this.lifePlanStore.serialize(),
        categories: this.categoryStore.serialize(),
        groups: this.groupStore.serialize(),
        assets: this.assetStore.serialize(),
      };
      return JSON.stringify(data);
    } catch (error) {
      console.error("データのエクスポートに失敗しました:", error);
      throw error;
    }
  }

  /**
   * アプリケーションデータのインポート
   */
  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.hydrateStores(data);
      await this.saveToStorage();
      return true;
    } catch (error) {
      console.error("データのインポートに失敗しました:", error);
      throw error;
    }
  }

  /**
   * アプリケーションデータのリセット
   */
  async resetData() {
    try {
      await AsyncStorage.removeItem("appData");
      this.lifePlanStore.reset();
      this.categoryStore.reset();
      this.groupStore.reset();
      this.assetStore.reset();
      return true;
    } catch (error) {
      console.error("データのリセットに失敗しました:", error);
      throw error;
    }
  }
}

// シングルトンインスタンスの作成
export const rootStore = new RootStore();
