/**
 * @file src/renderer/src/App.tsx
 * @description アプリケーションのルートコンポーネント
 */
import React, { useEffect } from 'react'
import { ChakraProvider, Flex, Box, HStack, Heading, Text, Image, Spacer, Button } from '@chakra-ui/react' // Box, HStack, Heading, Text, Image, Spacer, Button をインポート
import { Provider as JotaiProvider, useSetAtom, useAtomValue } from 'jotai' // useAtomValue をインポート
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
import { FaChartLine } from 'react-icons/fa' // FaChartLine をインポート

import { theme } from './theme'
import { loadScenariosAtom, isGraphViewVisibleAtom, predictionResultsAtom } from '@renderer/store/atoms' // predictionResultsAtom, isGraphViewVisibleAtom をインポート
import { ControlPanel } from '@renderer/components/ControlPanel'
import { DataView } from '@renderer/components/DataView'
import { GraphView } from '@renderer/components/GraphView'
import icon from '@renderer/assets/icon.png?asset' // icon をインポート
import '@fontsource/m-plus-rounded-1c/700.css' // フォントをインポート

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function AppContent(): React.JSX.Element {
  const loadScenarios = useSetAtom(loadScenariosAtom)
  const setIsGraphViewVisible = useSetAtom(isGraphViewVisibleAtom) // GraphView表示状態を制御するsetter
  const predictionResults = useAtomValue(predictionResultsAtom) // 予測結果を取得

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return (
    <Flex h="100vh" w="100vw" bg="brand.base" overflow="hidden" flexDirection="column"> {/* 全体を縦方向に配置 */}

      {/* メインコンテンツ領域（ControlPanel, DataView, GraphView） */}
      <Flex flex="1" overflow="hidden"> {/* 残りのスペースを占めるように flex="1" を設定 */}
        <ControlPanel />

        {/* DataViewをBoxで囲み、flexプロパティを設定 */}
        <Box flex="1" minW={0}>
          <HStack
            p={4}
            borderBottom="1px solid"
            borderColor="gray.200"
            bg="brand.base"
            justifyContent="flex-end"
            spacing={4}
            flexShrink={0} // ヘッダーが縮まないように固定
          >
            <Heading
              size="lg"
              color="brand.accent"
              fontFamily={'M PLUS Rounded 1c'}
              fontWeight="bold"
            >
              <HStack>
                <Image src={icon} boxSize={8}/>
                <Text>
                  Miraishi
                </Text>
              </HStack>
            </Heading>
            <Spacer />
            <Button
              leftIcon={<FaChartLine />}
              colorScheme="purple"
              onClick={(): void => setIsGraphViewVisible(true)}
              size="sm"
              isDisabled={predictionResults.length === 0} // 予測結果がない場合はボタンを無効化
            >
              グラフ表示
            </Button>
          </HStack>
          <DataView />
        </Box>
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
