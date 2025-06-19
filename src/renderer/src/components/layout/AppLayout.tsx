import { Box, Flex, Text } from '@chakra-ui/react'
import { ControlPanel } from './ControlPanel'
import React, { useState } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

// パネルの幅を定数として定義
const EXPANDED_WIDTH = 272
const COLLAPSED_WIDTH = 72

export function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  // パネルが展開されているかどうかの状態
  const [isExpanded, setIsExpanded] = useState(true)

  // 状態に応じてパネルの幅を決定
  const panelWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH

  return (
    <Flex h="100vh" bg="brand.base" overflow="hidden">
      <ControlPanel
        onToggle={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
        width={panelWidth}
      />

      {/* メインコンテンツエリア */}
      <Flex direction="column" flex="1">
        {/* ヘッダー */}
        <Flex
          as="header"
          align="center"
          p={2}
          h="57px" // ControlPanelのヘッダーの高さと合わせる
          bg="app.backgrond"
          borderBottom="1px"
          borderColor="component.border"
        >
          <Text fontSize={'3xl'} color={'app.text.primary'} fontWeight={'bold'}>
            Miraishi
          </Text>
        </Flex>

        {/* メインの表示領域 */}
        <Box as="main" flex="1" p={4}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
