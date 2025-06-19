import { ChakraProvider, createSystem, defaultConfig, Box, Text } from '@chakra-ui/react'
import { config } from './theme'
import { AppLayout } from './components/layout/AppLayout'
import React from 'react' // ★ 作成したAppLayoutをインポート

// デフォルト設定と独自の設定をマージしてシステムを生成
const system = createSystem(defaultConfig, config)

// アプリケーションのメインコンテンツ部分
function MainContent(): React.JSX.Element {
  return (
    // ★ AppLayoutでコンテンツを囲む
    <AppLayout>
      <Box>
        <Text fontSize="xl" fontWeight="bold">
          メインパネル
        </Text>
        <Text color="app.text.secondary">
          このエリアに、データビューやグラフビューが表示されます。
        </Text>
      </Box>
    </AppLayout>
  )
}

// アプリケーションのルート
export default function App(): React.JSX.Element {
  return (
    // 生成した`system`をChakraProviderの`value`に渡す
    <ChakraProvider value={system}>
      <MainContent />
    </ChakraProvider>
  )
}
