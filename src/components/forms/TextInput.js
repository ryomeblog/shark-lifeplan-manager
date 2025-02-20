import React from "react";
import { TextInput as RNTextInput, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const TextInput = React.forwardRef(({ style, error, ...props }, ref) => {
  const theme = useTheme();

  return (
    <RNTextInput
      ref={ref}
      style={[
        styles.input,
        {
          borderColor: error ? theme.colors.error : theme.colors.backdrop,
          color: theme.colors.text,
        },
        style,
      ]}
      placeholderTextColor={theme.colors.placeholder}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 4,
  },
});

export default TextInput;
