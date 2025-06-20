import { defineConfig, createSystem, defaultConfig } from '@chakra-ui/react'

// 1. スタイリング設定を定義します
const config = defineConfig({
  // 2. グローバルCSSでbody全体のスタイルを定義します
  globalCss: {
    body: {
      fontFamily: 'body', // 'body'という役割名（トークン）を指定します
      bg: 'app.background',
      color: 'app.text.primary'
    }
  },

  // 3. テーマの値を定義します
  theme: {
    // 3a. デザインの最小単位である「トークン」を定義します
    tokens: {
      fonts: {
        // フォントに 'body' や 'heading' という役割名を付けます
        body: { value: "'Zen Maru Gothic', sans-serif" },
        heading: { value: "'Zen Maru Gothic', sans-serif" }
      },
      colors: {
        brand: {
          offWhite: { value: '#fdfbf4' },
          navy: { value: '#1e1e68' },
          teal: { value: 'rgb(7,223,112)' },
          tealLight: { value: '#48D1CC' },
          tealDark: { value: '#276c6b' },
          cardBg: { value: 'rgb(255,249,224)' },
          deepBg: { value: '#d5bca4' }
        },
        neutral: {
          darkGray: { value: '#4A4A4A' },
          lightGray: { value: '#bfbfbf' }
        }
      }
    },

    // 3b. 状況に応じて変化する「セマンティックトークン」を定義します
    semanticTokens: {
      colors: {
        'app.background': { value: '{colors.brand.offWhite}' },
        'component.background': { value: '{colors.brand.cardBg}' },
        'app.text.primary': { value: '{colors.brand.navy}' },
        'app.text.secondary': { value: '{colors.neutral.darkGray}' },
        'component.border': { value: '{colors.neutral.lightGray}' },
        'app.accent': { value: '{colors.brand.teal}' },
        'app.accent.light': { value: '{colors.brand.tealLight}' },
        'app.accent.dark': { value: '{colors.brand.tealDark}' }
      }
    },

    // 3c. コンポーネントのスタイル「レシピ」を定義します
    recipes: {
      // ChakraのHeadingコンポーネントにデフォルトでheadingフォントを適用します
      heading: {
        base: {
          fontFamily: 'heading'
        }
      },
      button: {
        base: {
          fontFamily: 'heading'
        }
      }
    }
  }
})

// 4. 設定からスタイリングエンジンを作成し、エクスポートします
export const system = createSystem(defaultConfig, config)
