/**
 * @file src/renderer/src/components/ControlPanel.tsx
 * @description 左側に表示される開閉可能なコントロールパネルコンポーネント
 */
import React, { useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { FaAngleLeft, FaAngleRight, FaPlus, FaSearch, FaTimes, FaTrash } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { AnimatePresence, motion } from 'framer-motion'

import {
  activeScenarioIdsAtom,
  createScenarioAtom,
  deleteScenarioAtom,
  filteredScenariosAtom,
  isControlPanelOpenAtom,
  searchQueryAtom
} from '@renderer/store/atoms'

// アニメーション用のコンポーネント
const MotionButton = motion.create(Button)

export function ControlPanel(): React.JSX.Element {
  // const [scenarios] = useAtom(scenariosAtom) // 🔽 削除：直接 scenariosAtom を使用しない
  const [scenariosToDisplay] = useAtom(filteredScenariosAtom) // 🔽 変更：フィルタリングされたシナリオを使用
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const [activeIds, setActiveIds] = useAtom(activeScenarioIdsAtom)
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)

  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [targetIdToDelete, setTargetIdToDelete] = useState<string | null>(null)
  const [isClickOpen, setIsClickOpen] = useState<boolean>(false)

  // const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false) // 🔽 削除：ローカルステートではなくアトムを使用
  // const [searchQuery, setSearchQuery] = useState<string>('') // 🔽 削除：ローカルステートではなくアトムを使用
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false) // 検索フォームの開閉はUIの状態なのでローカルステートのまま
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom) // 🔽 変更：searchQueryAtom を使用
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleDeleteClick = (scenarioId: string): void => {
    setTargetIdToDelete(scenarioId)
    onAlertOpen()
  }

  const confirmDelete = (): void => {
    if (targetIdToDelete) {
      deleteScenario(targetIdToDelete)
    }
    onAlertClose()
  }

  const handleCreateNewScenario = async (): Promise<void> => {
    await createScenario()
  }

  const handleScenarioSelect = (scenarioId: string): void => {
    setActiveIds((currentIds) => {
      if (currentIds.includes(scenarioId)) {
        return currentIds.filter((id) => id !== scenarioId)
      } else {
        return [...currentIds, scenarioId]
      }
    })
  }

  const timerRef = useRef<number | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const isHoveringRef = useRef<boolean>(false)

  const handleMouseEnter = (): void => {
    isHoveringRef.current = true

    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      if (isHoveringRef.current) {
        setIsOpen(true)
      }
      timerRef.current = null
    }, 200)
  }

  const handleMouseLeave = (): void => {
    isHoveringRef.current = false

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    leaveTimerRef.current = window.setTimeout(() => {
      if (!isClickOpen) {
        setIsOpen(false)
        setIsSearchOpen(false)
        setSearchQuery('')
      }
      leaveTimerRef.current = null
    }, 200)
  }

  const handleOpenClick = (): void => {
    if (!isOpen) {
      setIsOpen(true)
      setIsClickOpen(true)
    } else if (isOpen && !isClickOpen) {
      setIsClickOpen(true)
    } else {
      setIsOpen(false)
      setIsClickOpen(false)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleIconButtonMouseEnter = (e: React.MouseEvent): void => {
    e.stopPropagation()
    isHoveringRef.current = false

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleIconButtonMouseLeave = (e: React.MouseEvent): void => {
    e.stopPropagation()
  }

  const handleSearchClick = (): void => {
    setIsSearchOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)
  }

  const handleClearSearch = (): void => {
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  const handleSearchBlur = (): void => {
    setTimeout(() => {
      if (searchQuery === '') {
        setIsSearchOpen(false)
      }
    }, 100)
  }

  return (
    <>
      <Box
        w={isOpen ? '280px' : '74px'}
        h="100vh"
        bg="brand.white"
        p={4}
        boxShadow="lg"
        zIndex={10}
        transition="width 0.2s ease-in-out"
        flexShrink={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <VStack align="stretch" spacing={4} h="100%">
          <HStack h={'42px'} justifyContent="flex-start" alignItems="center">
            {/* パネルトグルボタン */}
            <Tooltip label={!isOpen ? '開く' : '閉じる'} placement="right">
              <IconButton
                aria-label="Toggle Panel"
                icon={isOpen ? <FaAngleLeft /> : <FaAngleRight />}
                variant="ghost"
                onClick={handleOpenClick}
                onMouseEnter={handleIconButtonMouseEnter}
                onMouseLeave={handleIconButtonMouseLeave}
              />
            </Tooltip>

            {/* 検索機能のUI - アニメーション改善 */}
            {isOpen && (
              <Flex flex="1" justifyContent="flex-end" alignItems="center" overflow="hidden">
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    width: isSearchOpen ? '100%' : '32px',
                    opacity: 1
                  }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <HStack
                    spacing={isSearchOpen ? 2 : 0}
                    bg="gray.100"
                    borderRadius="full"
                    pl={isSearchOpen ? 2 : 0}
                    pr={isSearchOpen ? 1 : 0}
                    py={isSearchOpen ? 1 : 0}
                    border={isSearchOpen ? '1px solid' : 'none'}
                    borderColor="brand.accent"
                    cursor={!isSearchOpen ? 'pointer' : 'default'}
                    onClick={!isSearchOpen ? handleSearchClick : undefined}
                    w="100%"
                  >
                    <IconButton
                      aria-label="Search Scenarios"
                      icon={<FaSearch />}
                      variant="ghost"
                      size="sm"
                      onClick={isSearchOpen ? undefined : handleSearchClick}
                      _hover={{ bg: 'transparent' }}
                      _active={{ bg: 'transparent' }}
                      pointerEvents={isSearchOpen ? 'none' : 'auto'}
                    />

                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: '100%', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden', flexGrow: 1 }}
                        >
                          <Input
                            ref={searchInputRef}
                            placeholder="検索..."
                            size="md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="unstyled"
                            flex="1"
                            h="auto"
                            onBlur={handleSearchBlur}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isSearchOpen && searchQuery && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <IconButton
                            aria-label="Clear Search"
                            icon={<FaTimes />}
                            size="xs"
                            variant="ghost"
                            onClick={handleClearSearch}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </HStack>
                </motion.div>
              </Flex>
            )}
          </HStack>

          <Tooltip label="新規シナリオ作成" isDisabled={isOpen} placement="right">
            <MotionButton
              colorScheme="teal"
              bg="brand.accent"
              color="white"
              onClick={handleCreateNewScenario}
              justifyContent="flex-start"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              {isOpen && (
                <Text ml={3} noOfLines={1}>
                  新しいシナリオ
                </Text>
              )}
            </MotionButton>
          </Tooltip>

          <Divider />

          {isOpen && (
            <Box flex="1" overflowY="auto" pr={2}>
              <Text fontSize={'lg'} fontWeight={'bold'} mb={4} noOfLines={1}>
                シナリオリスト
              </Text>
              {/* 🔽 変更：scenariosToDisplay (フィルタリングされたシナリオ) を使用 */}
              {scenariosToDisplay.length > 0 ? (
                scenariosToDisplay.map((scenario) => {
                  const isActive = activeIds.includes(scenario.id)
                  return (
                    <HStack key={scenario.id} w="100%" mb={2}>
                      <MotionButton
                        variant={isActive ? 'solid' : 'ghost'}
                        colorScheme={isActive ? 'teal' : 'gray'}
                        bg={isActive ? 'brand.accent' : 'transparent'}
                        color={isActive ? 'white' : 'inherit'}
                        flex="1"
                        justifyContent="flex-start"
                        onClick={() => handleScenarioSelect(scenario.id)}
                        _hover={{ bg: !isActive ? 'gray.100' : 'brand.accent' }}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Text noOfLines={1}>{scenario.title}</Text>
                      </MotionButton>
                      <IconButton
                        aria-label="Delete scenario"
                        icon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={(): void => handleDeleteClick(scenario.id)}
                      />
                    </HStack>
                  )
                })
              ) : (
                <Text fontSize="sm" color="brand.darkGray" textAlign="center" mt={4}>
                  {searchQuery ? '該当するシナリオはありません' : 'シナリオはありません'}{' '}
                  {/* 検索中のメッセージを追加 */}
                </Text>
              )}
              {/* 🔼 */}
            </Box>
          )}
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              シナリオを削除
            </AlertDialogHeader>
            <AlertDialogBody>
              本当にこのシナリオを削除しますか？この操作は元に戻せません。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
