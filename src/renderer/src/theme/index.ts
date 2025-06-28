/**
 * @file src/renderer/src/theme/index.ts
 * @description Chakra UIのカスタムテーマ定義
 */
import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    base: '#f8f5e8',
    main: '#2c2e42',
    accent: '#00A3A3',
    white: '#FFFFFF',
    lightGray: '#D0D0D0',
    darkGray: '#4A4A4A',
    danger: '#E53E3E'
  }
}

const styles = {
  global: {
    // 🔽 ----- フォントを全体に適用 ----- 🔽
    body: {
      bg: 'brand.base',
      color: 'brand.main',
      fontFamily: "'Zen Maru Gothic', sans-serif"
    },
    // 🔽 ----- スクロールバーのデザインを修正 ----- 🔽
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px'
    },
    '::-webkit-scrollbar-track': {
      background: 'brand.base'
    },
    '::-webkit-scrollbar-thumb': {
      background: 'brand.lightGray',
      borderRadius: '4px'
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'brand.darkGray'
    }
  }
}

export const theme = extendTheme({ colors, styles })
