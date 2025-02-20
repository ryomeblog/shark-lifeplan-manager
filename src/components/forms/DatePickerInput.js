import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { TextInput, TouchableRipple } from "react-native-paper";
import { COLORS } from "../../constants";
import { formatDate } from "../../utils/format";

/**
 * 日付選択入力コンポーネント
 */
const DatePickerInput = ({
  label,
  value,
  onChange,
  error,
  style,
  format = "medium",
  minimumDate,
  maximumDate,
  mode = "date",
}) => {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  /**
   * 日付変更ハンドラ
   */
  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]);
    }
  };

  /**
   * 入力フィールドタップ時の処理
   */
  const handlePress = () => {
    setShow(true);
  };

  return (
    <>
      <TouchableRipple onPress={handlePress}>
        <TextInput
          label={label}
          defaultValue={value ? formatDate(value, format) : ""}
          error={error}
          editable={false}
          style={[styles.input, style]}
          right={<TextInput.Icon name="calendar" />}
        />
      </TouchableRipple>

      {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.common.white,
  },
});

export default DatePickerInput;
