/**
 * @file src/renderer/src/App.tsx
 * @description アプリケーションのルートコンポーネント
 */
import React, { useEffect } from 'react'
import { ChakraProvider, Flex, VStack } from '@chakra-ui/react'
import { Provider as JotaiProvider, useSetAtom } from 'jotai'
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
import { loadScenariosAtom } from '@renderer/store/atoms'
// 🔽 --- パス修正 --- 🔽
import { ControlPanel } from '@renderer/components/ControlPanel'
import { DataView } from '@renderer/components/DataView'
import { GraphView } from '@renderer/components/GraphView'
import { Header } from '@renderer/components/Header'
// 🔼 --- パス修正 --- 🔼

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
ChartJS.defaults.font.family =
  "'Zen Maru Gothic', 'M PLUS Rounded 1c', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic UI', 'Meiryo', sans-serif"

function AppContent(): React.JSX.Element {
  const loadScenarios = useSetAtom(loadScenariosAtom)

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return (
    <Flex h="100vh" w="100vw" bg="brand.base" overflow="hidden" flexDirection="column">
      <Flex flex="1" overflow="hidden">
        <ControlPanel />
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
