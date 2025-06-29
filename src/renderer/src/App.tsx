/**
 * @file src/renderer/src/App.tsx
 * @description アプリケーションのルートコンポーネント
 */
import React, { useEffect } from 'react'
import { ChakraProvider, Flex, VStack } from '@chakra-ui/react' // Box, HStack, Heading, Text, Image, Spacer, Button をインポート
import { Provider as JotaiProvider, useSetAtom } from 'jotai' // useAtomValue をインポート
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'

import { theme } from './theme'
import { loadScenariosAtom } from '@renderer/store/atoms' // predictionResultsAtom, isGraphViewVisibleAtom をインポート
import { ControlPanel } from '@renderer/components/ControlPanel'
import { DataView } from '@renderer/components/DataView'
import { GraphView } from '@renderer/components/GraphView'
import { Header } from '@renderer/components/Header'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function AppContent(): React.JSX.Element {
  const loadScenarios = useSetAtom(loadScenariosAtom)

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return (
    <Flex h="100vh" w="100vw" bg="brand.base" overflow="hidden" flexDirection="column">
      {/* メインコンテンツ領域（ControlPanel, DataView, GraphView） */}
      <Flex flex="1" overflow="hidden">
        <ControlPanel />

        {/* DataViewをBoxで囲み、flexプロパティを設定 */}
        <VStack w={'100%'} h={'100vh'} spacing={0}>
          <Header />
          <DataView />
        </VStack>
        <GraphView />
      </Flex>
    </Flex>
  )
}

function App(): React.JSX.Element {
  return (
    <JotaiProvider>
      <ChakraProvider theme={theme}>
        <AppContent />
      </ChakraProvider>
    </JotaiProvider>
  )
}

export default App
