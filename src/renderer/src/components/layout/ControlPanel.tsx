import {
  VStack,
  Text,
  Flex,
  IconButton,
  Button,
  ButtonProps,
  Box,
  HStack
} from '@chakra-ui/react'
import { RxPencil2, RxHamburgerMenu } from 'react-icons/rx'
import { GoGear, GoSearch } from 'react-icons/go'
import React from 'react'

interface ControlPanelProps {
  onToggle: () => void // パネルの開閉を切り替えるための関数
  isExpanded: boolean // パネルが展開されているかどうかの状態
  width: number // 現在のパネルの幅
}

interface ExpandingTextButtonProps extends ButtonProps {
  isExpanded: boolean
  icon?: React.JSX.Element
}

const ExpandingTextButton: React.FC<ExpandingTextButtonProps> = ({
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
      transition="all 0.2s ease-in-out"
      _hover={{
        bg: 'app.accent.dark',
        boxShadow: 'none',
        cursor: 'pointer' // カーソルをポインターに変更
      }}
    >
      <HStack w={'100%'} justifyContent={'flex-start'}>
        <IconButton bg={"inherit"} size={'lg'}>
          {icon}
        </IconButton>
        {isExpanded && (
          <Box>
            {children ??
              <Text as="span" ml={3}>
                {children}
              </Text>
            }
          </Box>
        )}
      </HStack>
    </Button>
  )
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
        <HStack minH="40px" justifyContent="space-between">
          <ExpandingTextButton
            isExpanded={false}
            onClick={onToggle}
            bg={'app.accent'}
            icon={<RxHamburgerMenu size={'1.2em'} />}
          />
          {isExpanded && (
            <ExpandingTextButton
              isExpanded={false}
              bg={'app.accent'}
              icon={<GoSearch size={'1.2em'} />}
            />
          )}
        </HStack>
        <ExpandingTextButton
          isExpanded={isExpanded}
          icon={<RxPencil2 size={'1.2em'} />}
          bg={'app.accent'}
        >
          新規作成
        </ExpandingTextButton>
        {/*<Button {...ButtonStyles}>*/}
        {/*  <RxPencil2 size="20px" />*/}
        {/*  {isExpanded && (*/}
        {/*    <Text as="span" ml={3}>*/}
        {/*      新規作成*/}
        {/*    </Text>*/}
        {/*  )}*/}
        {/*</Button>*/}
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
        <ExpandingTextButton
          isExpanded={isExpanded}
          icon={<GoGear size="1.2em" />}
          bg={'app.accent'}
        >
          設定
        </ExpandingTextButton>
      </VStack>
    </Flex>
  )
}
