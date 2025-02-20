/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * 必須項目チェック
 * @param {any} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @throws {ValidationError}
 */
export const validateRequired = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName}は必須項目です`, fieldName);
  }
};

/**
 * 数値範囲チェック
 * @param {number} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @param {object} options - オプション（min, max）
 * @throws {ValidationError}
 */
export const validateNumber = (value, fieldName, { min, max } = {}) => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(
      `${fieldName}は数値で入力してください`,
      fieldName,
    );
  }

  if (min !== undefined && value < min) {
    throw new ValidationError(
      `${fieldName}は${min}以上で入力してください`,
      fieldName,
    );
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(
      `${fieldName}は${max}以下で入力してください`,
      fieldName,
    );
  }
};

/**
 * 日付の妥当性チェック
 * @param {string|Date} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @param {object} options - オプション（minDate, maxDate）
 * @throws {ValidationError}
 */
export const validateDate = (value, fieldName, { minDate, maxDate } = {}) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(
      `${fieldName}は有効な日付で入力してください`,
      fieldName,
    );
  }

  if (minDate && date < new Date(minDate)) {
    throw new ValidationError(
      `${fieldName}は${new Date(minDate).toLocaleDateString()}以降で入力してください`,
      fieldName,
    );
  }

  if (maxDate && date > new Date(maxDate)) {
    throw new ValidationError(
      `${fieldName}は${new Date(maxDate).toLocaleDateString()}以前で入力してください`,
      fieldName,
    );
  }
};

/**
 * 文字列長チェック
 * @param {string} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @param {object} options - オプション（minLength, maxLength）
 * @throws {ValidationError}
 */
export const validateLength = (
  value,
  fieldName,
  { minLength, maxLength } = {},
) => {
  if (typeof value !== "string") {
    throw new ValidationError(
      `${fieldName}は文字列で入力してください`,
      fieldName,
    );
  }

  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName}は${minLength}文字以上で入力してください`,
      fieldName,
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName}は${maxLength}文字以下で入力してください`,
      fieldName,
    );
  }
};

/**
 * カラーコードの妥当性チェック
 * @param {string} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @throws {ValidationError}
 */
export const validateColorCode = (value, fieldName) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    throw new ValidationError(
      `${fieldName}は有効なカラーコード（#RRGGBB形式）で入力してください`,
      fieldName,
    );
  }
};

/**
 * 金額の妥当性チェック
 * @param {number} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @throws {ValidationError}
 */
export const validateAmount = (value, fieldName) => {
  validateNumber(value, fieldName, { min: 0 });

  if (!Number.isInteger(value)) {
    throw new ValidationError(
      `${fieldName}は整数で入力してください`,
      fieldName,
    );
  }
};

/**
 * パーセンテージの妥当性チェック
 * @param {number} value - チェックする値（0.1 = 10%）
 * @param {string} fieldName - フィールド名
 * @throws {ValidationError}
 */
export const validatePercentage = (value, fieldName) => {
  validateNumber(value, fieldName, { min: 0, max: 1 });
};

/**
 * 列挙型の妥当性チェック
 * @param {string} value - チェックする値
 * @param {string} fieldName - フィールド名
 * @param {string[]} allowedValues - 許可される値の配列
 * @throws {ValidationError}
 */
export const validateEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName}は${allowedValues.join(", ")}のいずれかを指定してください`,
      fieldName,
    );
  }
};

/**
 * ライフプランデータの妥当性チェック
 * @param {object} data - チェックするデータ
 * @throws {ValidationError}
 */
export const validateLifePlan = (data) => {
  validateRequired(data.name, "名称");
  validateLength(data.name, "名称", { maxLength: 100 });

  validateRequired(data.startYear, "開始年");
  validateNumber(data.startYear, "開始年", { min: 1900, max: 2100 });

  validateRequired(data.lifespan, "想定寿命");
  validateNumber(data.lifespan, "想定寿命", { min: 1, max: 100 });

  validateRequired(data.inflationRate, "インフレ率");
  validatePercentage(data.inflationRate, "インフレ率");

  if (data.description) {
    validateLength(data.description, "説明", { maxLength: 1000 });
  }
};

/**
 * 資産データの妥当性チェック
 * @param {object} data - チェックするデータ
 * @throws {ValidationError}
 */
export const validateAsset = (data) => {
  validateRequired(data.name, "名称");
  validateLength(data.name, "名称", { maxLength: 100 });

  validateRequired(data.initialAmount, "初期投資額");
  validateAmount(data.initialAmount, "初期投資額");

  validateRequired(data.category, "カテゴリ");
  validateRequired(data.startDate, "開始日");
  validateDate(data.startDate, "開始日");

  if (data.maturityDate) {
    validateDate(data.maturityDate, "満期日", { minDate: data.startDate });
  }

  if (data.returns) {
    validateRequired(data.returns.capitalGain.annualRate, "年間期待収益率");
    validatePercentage(data.returns.capitalGain.annualRate, "年間期待収益率");

    validateRequired(
      data.returns.capitalGain.compoundingFrequency,
      "複利計算頻度",
    );
    validateEnum(
      data.returns.capitalGain.compoundingFrequency,
      "複利計算頻度",
      ["yearly", "monthly", "daily"],
    );

    if (data.returns.incomeGain) {
      validateRequired(data.returns.incomeGain.dividendYield, "配当利回り");
      validatePercentage(data.returns.incomeGain.dividendYield, "配当利回り");

      validateRequired(
        data.returns.incomeGain.paymentFrequency,
        "配当支払頻度",
      );
      validateEnum(data.returns.incomeGain.paymentFrequency, "配当支払頻度", [
        "yearly",
        "quarterly",
        "monthly",
      ]);
    }
  }
};
