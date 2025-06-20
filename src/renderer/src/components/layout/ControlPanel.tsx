import {
  VStack,
  Text,
  Flex,
  IconButton,
  Button,
  ButtonProps,
  Box,
  HStack,
  Separator,
  Input
} from '@chakra-ui/react'
import { RxPencil2, RxHamburgerMenu, RxCross2 } from 'react-icons/rx'
import { GoGear, GoSearch } from 'react-icons/go'
import React, { useState, useRef, useEffect } from 'react'

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
  const controlPanelRef = useRef(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isClickedHamburger = useRef(false)

  // isSearchOpenがtrueになったら、Inputにフォーカスを当てる
  useEffect(() => {
    if (isSearchOpen) {
      // transitionのアニメーションが終わるのを待ってからフォーカス
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isSearchOpen])

  // Inputからフォーカスが外れ、かつ入力が空の場合に検索フォームを閉じる
  const handleInputBlur = (): void => {
    // クリアボタン押下時など、すぐには閉じないように少し遅延させる
    setTimeout(() => {
      if (inputRef.current?.value === '') {
        setIsSearchOpen(false)
      }
    }, 300)
  }

  const handlePanelToggle = (): void => {
    isClickedHamburger.current = !isClickedHamburger.current
    if (!isExpanded) panelToggle()
  }

  const handleOpenPanel = (): void => {
    setTimeout(() => {
      if (!isClickedHamburger.current) panelOpen()
    }, 100)
  }
  const handleClosePanel = (): void => {
    setTimeout(() => {
      if (!isClickedHamburger.current) panelClose()
      setIsSearchOpen(false)
    }, 100)
  }
  // 検索をする関数(現在はモック)
  const handleSubmit = (): void => {}

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
      onMouseOver={handleOpenPanel}
      onMouseLeave={handleClosePanel}
      ref={controlPanelRef}
      gap={4}
    >
      {/* --- ヘッダー --- */}
      <Flex direction="column">
        <HStack minH="40px" justifyContent="space-between">
          {/* ハンバーガーメニュー (検索フォーム展開中は非表示) */}
          <Box transition={'opacity 0.2s ease'}>
            <ExpandingButton
              isExpanded={false}
              onClick={handlePanelToggle}
              bg={'app.accent'}
              icon={<RxHamburgerMenu size={'1.2em'} />}
            />
          </Box>

          {/* 検索フォーム (パネル展開時のみ表示) */}
          {isExpanded && (
            <Flex
              position="relative"
              h="44px"
              alignItems="center"
              justifyContent="flex-start" // 左詰め
              w={isSearchOpen ? '100%' : '44px'}
              transition="width 0.3s ease-in-out"
            >
              {/* 検索アイコン (常に表示、クリックでフォーム展開) */}
              <IconButton
                aria-label="検索を開く"
                bg={isSearchOpen ? 'transparent' : 'app.accent'}
                disabled={isSearchOpen}
                cursor={'pointer'}
                color={isSearchOpen ? 'app.text.secondary' : 'white'}
                size="lg"
                rounded={'3xl'}
                position="absolute"
                top="50%"
                left="0"
                transform="translateY(-50%)"
                onClick={() => {
                  if (isSearchOpen) {
                    handleSubmit()
                  } else {
                    setIsSearchOpen(true)
                  }
                }}
                _hover={{ bg: isSearchOpen ? '' : 'app.accent.dark' }}
                zIndex={1} // Inputの上に表示
              >
                <GoSearch size="1.2em" />
              </IconButton>

              {/* 検索入力フィールド */}
              <Input
                ref={inputRef}
                placeholder="検索..."
                h="100%"
                w="100%"
                borderWidth="1px"
                borderColor="app.accent"
                bg="component.background"
                rounded="full"
                pl="44px" // 検索アイコンのスペース
                pr="44px" // クリアボタンのスペース
                opacity={isSearchOpen ? 1 : 0}
                pointerEvents={isSearchOpen ? 'auto' : 'none'}
                transition="opacity 0.2s ease-in-out"
                onSubmit={handleSubmit}
                onBlur={handleInputBlur}
              />

              {/* クリアボタン */}
              <IconButton
                aria-label="検索をクリア"
                variant="ghost"
                color="app.text.secondary"
                size="md"
                position="absolute"
                right="4px"
                top="50%"
                transform="translateY(-50%)"
                opacity={isSearchOpen ? 1 : 0}
                pointerEvents={isSearchOpen ? 'auto' : 'none'}
                transition="opacity 0.2s ease-in-out"
                onClick={() => {
                  // if (inputRef.current) inputRef.current.value = ''
                  setIsSearchOpen(false)
                }}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                <RxCross2 size="1.2em" />
              </IconButton>
            </Flex>
          )}
        </HStack>
      </Flex>
      <Separator size={'lg'} />

      {/* --- シナリオリスト (ボディ) --- */}
      <VStack align="stretch" flex="1" overflowY="auto" overflowX={'hidden'}>
        <ExpandingButton
          isExpanded={isExpanded}
          icon={<RxPencil2 size={'1.2em'} />}
          bg={'app.accent'}
        >
          新規作成
        </ExpandingButton>
        <Text fontSize="sm" fontWeight="bold" color="app.text.secondary" px={3}>
          {isExpanded ? 'シナリオ一覧' : ''}
        </Text>
        {/* (ここにシナリオのリストを.mapで展開) */}
      </VStack>

      <Separator size={'lg'} />
      {/* --- フッター --- */}
      <VStack align="stretch">
        <ExpandingButton isExpanded={isExpanded} icon={<GoGear size="1.2em" />} bg={'app.accent'}>
          設定
        </ExpandingButton>
      </VStack>
    </Flex>
  )
}
