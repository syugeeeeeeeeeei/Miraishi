/**
 * @file src/renderer/src/App.tsx
 * @description アプリケーションのルートコンポーネント
 */
import React, { useEffect } from 'react'
import { ChakraProvider, Flex, Box } from '@chakra-ui/react' // Box をインポート
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
import { GraphView } from '@renderer/components/GraphView'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function AppContent(): React.JSX.Element {
  const loadScenarios = useSetAtom(loadScenariosAtom)

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return (
    // 🔽 ----- Flexのプロパティを修正 ----- 🔽
    <Flex h="100vh" w="100vw" bg="brand.base" overflow="hidden">
      <ControlPanel />
      {/* DataViewをBoxで囲み、flexプロパティを設定 */}
      <Box flex="1" minW={0}>
        <DataView />
      </Box>
      <GraphView />
    </Flex>
    // 🔼 ----- ここまで ----- 🔼
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
