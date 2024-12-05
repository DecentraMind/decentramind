module.exports = {
  root: true,
  extends: [
    '@nuxt/eslint-config'
  ],
  rules: {
    // Global
    semi: ['error', 'never'],
    '@typescript-eslint/semi': ['error', 'never'],
    quotes: ['error', 'single'],
    'quote-props': ['error', 'as-needed'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_$' }],
    
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],
    // Vue
    'vue/multi-word-component-names': 0,
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: {
          max: 5
        }
      }
    ],
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-v-html': 0
  }
}
