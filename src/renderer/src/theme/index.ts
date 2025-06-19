import { defineConfig, SystemConfig } from '@chakra-ui/react'
const theme: SystemConfig = {
  theme: {
    // --- STEP 1: アプリで使うカラーパレットを`tokens`に定義 ---
    tokens: {
      colors: {
        brand: {
          offWhite: { value: '#f8f5e8' },
          navy: { value: '#1e1e68' },
          teal: { value: '#00A3A3' },
          tealLight: { value: '#48D1CC' },
          cardBg: { value: '#f5f1eb' },
          deepBg: { value: '#d5bca4' }
        },
        fonts: {
          body: { value: "Georgia, sans-serif" },
          heading: { value: "'Zen Maru Gothic', sans-serif" }
        },
        neutral: {
          darkGray: { value: '#4A4A4A' },
          lightGray: { value: '#bfbfbf' }
        }
      }
    },

    // --- STEP 2: `tokens`で定義した色に「役割」を割り当てる ---
    semanticTokens: {
      colors: {
        'app.background': {
          value: { base: '{white}' } // `base`はライトモード
        },
        'component.background': {
          value: { base: '{colors.brand.deepBg}' }
        },
        'app.text.primary': {
          value: { base: '{colors.brand.navy}' }
        },
        'app.text.secondary': {
          value: { base: '{colors.neutral.darkGray}' }
        },
        'component.border': {
          value: { base: '{colors.neutral.lightGray}' }
        },
        'app.accent': {
          value: { base: '{colors.brand.teal}' }
        }
      }
    },

    // --- STEP 3: コンポーネントのスタイル定義はそのまま活用 ---
    recipes: {
      button: {
        base: {
          borderRadius: 'md'
        }
      }
    }
  },

  // --- STEP 4: グローバルCSSでは役割名（セマンティックトークン）を使用 ---
  globalCss: {
    body: {
      // 直接的な色指定ではなく、役割で指定する
      bg: 'app.background',
      color: 'app.text.primary',
      fontFamily: 'body'
    }
  }
}

export const config = defineConfig(theme)
