module.exports = {
  arrowParens: "avoid",
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: "all",
  semi: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  overrides: [
    {
      files: "*.md",
      options: {
        proseWrap: "always",
      },
    },
  ],
};
