import { ChakraProvider, Box, Text } from '@chakra-ui/react'
import { system } from './theme'
import { AppLayout } from './components/layout/AppLayout'
import React from 'react'
import '@fontsource/zen-maru-gothic/400.css'
import '@fontsource/zen-maru-gothic/700.css'

// アプリケーションのメインコンテンツ部分
function MainContent(): React.JSX.Element {
  return (
    // ★ AppLayoutでコンテンツを囲む
    <AppLayout>
      <Box fontFamily={"'Zen Maru Gothic', sans-serif"}>
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
