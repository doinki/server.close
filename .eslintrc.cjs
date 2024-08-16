/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['mado/base'],
  ignores: ['dist'],
  parserOptions: {
    project: require.resolve('./tsconfig.json'),
  },
  root: true,
  rules: {
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'prefer-const': 'off',
  },
};
