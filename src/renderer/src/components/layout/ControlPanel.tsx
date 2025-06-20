import { VStack, Text, Flex, IconButton, Button, ButtonProps, Box, HStack, Separator } from '@chakra-ui/react'
import { RxPencil2, RxHamburgerMenu } from 'react-icons/rx'
import { GoGear, GoSearch } from 'react-icons/go'
import React from 'react'

interface ControlPanelProps {
  panelToggle: () => void // パネルの開閉を切り替えるための関数
  panelOpen: () => void // パネルを開くための関数
  panelClose: () => void // パネルを閉じるための
  isExpanded: boolean // パネルが展開されているかどうかの状態
  width: number // 現在のパネルの幅
}

interface ExpandingTextButtonProps extends ButtonProps {
  isExpanded: boolean
  icon?: React.JSX.Element
}

const ExpandingButton: React.FC<ExpandingTextButtonProps> = ({
  isExpanded,
  children,
  icon,
  ...props
}) => {
  return (
    <Button
      bg={props.bg} // 画像から色を取得し設定
      color="white"
      height="44px" // ボタンの高さを固定
      width={isExpanded ? '100%' : '44px'} // isExpandedに応じて幅を変更（例として200pxを設定）
      overflow="hidden" // テキストがはみ出るのを防ぐ
      {...props}
      px={0}
      rounded={'3xl'}
      transition="all 0.2s ease-in-out"
      _hover={{
        bg: 'app.accent.dark',
        boxShadow: 'none',
        cursor: 'pointer' // カーソルをポインターに変更
      }}
    >
      <HStack w={'100%'} justifyContent={'flex-start'}>
        <IconButton bg={'inherit'} size={'lg'}>
          {icon}
        </IconButton>
        {isExpanded && (
          <Box as="span" ml={3} textWrap={'nowrap'}>
            {children}
          </Box>
        )}
      </HStack>
    </Button>
  )
}
export function ControlPanel({
  panelToggle,
  panelOpen,
  panelClose,
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
      transition="width 0.15s ease" // widthの変化をアニメーションさせる
      flexShrink={0}
      overflow="hidden"
      whiteSpace="nowrap"
      onMouseOver={panelOpen}
      onMouseOut={panelClose}
    >
      {/* --- ヘッダー --- */}
      <Flex direction="column" gap={4}>
        <HStack minH="40px" justifyContent="space-between">
          <ExpandingButton
            isExpanded={false}
            onClick={panelToggle}
            bg={'app.accent'}
            icon={<RxHamburgerMenu size={'1.2em'} />}
          />
          {isExpanded && (
            <ExpandingButton
              isExpanded={false}
              bg={'app.accent'}
              icon={<GoSearch size={'1.2em'} />}
            />
          )}
        </HStack>
        <Separator size={'lg'} />
        <ExpandingButton
          isExpanded={isExpanded}
          icon={<RxPencil2 size={'1.2em'} />}
          bg={'app.accent'}
        >
          新規作成
        </ExpandingButton>
      </Flex>

      {/* --- シナリオリスト (ボディ) --- */}
      <VStack mt={6} align="stretch" flex="1" overflowY="auto" overflowX={'hidden'}>
        <Text fontSize="sm" fontWeight="bold" color="app.text.secondary" px={3}>
          {isExpanded ? 'シナリオ一覧' : ''}
        </Text>
        {/* (ここにシナリオのリストを.mapで展開) */}
      </VStack>

      <Separator size={'lg'} />
      {/* --- フッター --- */}
      <VStack align="stretch" pt={4}>
        <ExpandingButton isExpanded={isExpanded} icon={<GoGear size="1.2em" />} bg={'app.accent'}>
          設定
        </ExpandingButton>
      </VStack>
    </Flex>
  )
}
