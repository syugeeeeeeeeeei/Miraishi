/**
 * @file src/renderer/src/theme/index.ts
 * @description Chakra UIのカスタムテーマ定義
 */
import { extendTheme } from '@chakra-ui/react'

const colors = {
  // youken.mdで定義されたブランドカラー
  brand: {
    base: '#f8f5e8', // ベースカラー (オフホワイト)
    main: '#2c2e42', // メインコントラストカラー (ネイビー)
    accent: '#00A3A3', // アクセントカラー (Teal)
    white: '#FFFFFF',
    lightGray: '#D0D0D0',
    darkGray: '#4A4A4A',
    danger: '#E53E3E'
  }
}

const styles = {
  global: {
    body: {
      bg: 'brand.base',
      color: 'brand.main'
    }
  }
}

export const theme = extendTheme({ colors, styles })
