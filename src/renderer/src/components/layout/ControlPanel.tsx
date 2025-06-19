import { VStack, Text, Flex, IconButton, Button } from '@chakra-ui/react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { GoPencil, GoGear, GoSearch } from 'react-icons/go'
import React from 'react'

interface ControlPanelProps {
  onToggle: () => void // パネルの開閉を切り替えるための関数
  isExpanded: boolean // パネルが展開されているかどうかの状態
  width: number // 現在のパネルの幅
}

export function ControlPanel({
  onToggle,
  isExpanded,
  width
}: ControlPanelProps): React.JSX.Element {
  return (
    <Flex
      as="aside"
      direction="column"
      w={`${width}px`} // 親から渡された幅を適用
      h="100vh"
      bg="component.background"
      p={3}
      transition="width 0.25s ease" // widthの変化をアニメーションさせる
      flexShrink={0}
      overflow="hidden"
      whiteSpace="nowrap"
    >
      {/* --- ヘッダー --- */}
      <Flex direction="column" gap={4}>
        <Flex minH="40px" align="center">
          <IconButton
            aria-label="Toggle Panel"
            bg={'app.accent'}
            variant="solid"
            onClick={onToggle}
            size="lg"
          >
            <GiHamburgerMenu />
          </IconButton>
          {isExpanded && (
            <IconButton ml="auto" aria-label="Search" bg={'app.accent'} variant="solid" size="lg">
              <GoSearch />
            </IconButton>
          )}
        </Flex>

        <Button justifyContent={'flex-start'} bg={'app.accent'} variant="solid" size="lg" p={3}>
          <GoPencil size="1.2em" />
          {isExpanded && (
            <Text as="span" ml={4}>
              新規作成
            </Text>
          )}
        </Button>
      </Flex>

      {/* --- シナリオリスト (ボディ) --- */}
      <VStack mt={6} align="stretch" flex="1" overflowY="auto" overflowX={'hidden'}>
        <Text fontSize="sm" fontWeight="bold" color="app.text.secondary" px={3}>
          {isExpanded ? 'シナリオ一覧' : ''}
        </Text>
        {/* (ここにシナリオのリストを.mapで展開) */}
      </VStack>

      {/* --- フッター --- */}
      <VStack align="stretch" pt={4}>
        <Button justifyContent="flex-start" bg={'app.accent'} variant="solid" size="lg" p={3}>
          <GoGear size="1.2em" />
          {isExpanded && (
            <Text as="span" ml={4}>
              設定
            </Text>
          )}
        </Button>
      </VStack>
    </Flex>
  )
}
