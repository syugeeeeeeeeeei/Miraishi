/**
 * @file src/renderer/src/App.tsx
 * @description アプリケーションのルートコンポーネント
 */
import React, { useEffect } from 'react'
import { ChakraProvider, Flex } from '@chakra-ui/react'
import { Provider as JotaiProvider, useSetAtom } from 'jotai'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import { theme } from './theme'
import { loadScenariosAtom } from '@renderer/store/atoms'
import { ControlPanel } from '@renderer/components/ControlPanel'
import { DataView } from '@renderer/components/DataView'
import { GraphView } from '@renderer/components/GraphView' // ◀◀◀ インポート

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function AppContent(): React.JSX.Element {
  const loadScenarios = useSetAtom(loadScenariosAtom)

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return (
    <Flex h="100vh" bg="brand.base" overflow="hidden">
      <ControlPanel />
      <DataView />
      <GraphView /> {/* ◀◀◀ ここでGraphViewを描画 */}
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
