/**
 * モーダル表示時のログ出力を行う関数
 * @param {string} modalName - モーダルの名前
 */
export const logModalShow = modalName => {
  console.log(`Modal shown: ${modalName} at ${new Date().toISOString()}`);
};
