/**
 * @file src/renderer/src/components/ControlPanel.tsx
 * @description 左側に表示される開閉可能なコントロールパネルコンポーネント
 */
import React, { useRef, useState } from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  HStack,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tooltip,
  Divider
} from '@chakra-ui/react'
import { FaTrash, FaPlus, FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { motion } from 'framer-motion'
import {
  scenariosAtom,
  createScenarioAtom,
  deleteScenarioAtom,
  isControlPanelOpenAtom,
  activeScenarioIdsAtom
} from '@renderer/store/atoms'

// アニメーション用のコンポーネント
const MotionButton = motion.create(Button)

export function ControlPanel(): React.JSX.Element {
  const [scenarios] = useAtom(scenariosAtom)
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const [activeIds, setActiveIds] = useAtom(activeScenarioIdsAtom)
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)

  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [targetIdToDelete, setTargetIdToDelete] = useState<string | null>(null)
  const [isClickOpen, setIsClickOpen] = useState<boolean>(false)

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

    // Leave timerをクリア
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }

    // 既存のenter timerをクリア
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    // 500ms後にパネルを開く
    timerRef.current = window.setTimeout(() => {
      if (isHoveringRef.current) {
        // まだホバー中の場合のみ開く
        setIsOpen(true)
      }
      timerRef.current = null
    }, 200)
  }

  const handleMouseLeave = (): void => {
    isHoveringRef.current = false

    // Enter timerをクリア
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // 200ms後にパネルを閉じる（クリックで開いていない場合）
    leaveTimerRef.current = window.setTimeout(() => {
      if (!isClickOpen) {
        setIsOpen(false)
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
    }
  }

  // IconButtonのマウスイベントを処理する関数
  const handleIconButtonMouseEnter = (e: React.MouseEvent): void => {
    e.stopPropagation()
    isHoveringRef.current = false // IconButton上ではホバー状態を無効にする

    // Enter timerをクリア（パネルが開かないようにする）
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleIconButtonMouseLeave = (e: React.MouseEvent): void => {
    e.stopPropagation()
    // IconButtonから出た時は親要素のmouseenterが再度発火するので特に処理不要
  }

  return (
    <>
      <Box
        w={isOpen ? '280px' : '74px'} // 幅を広げる
        h="100vh"
        bg="brand.white"
        p={4} // 余白を調整
        boxShadow="lg" // 影を少し強く
        zIndex={10}
        transition="width 0.2s ease-in-out" // アニメーションを滑らかに
        flexShrink={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <VStack align="stretch" spacing={4} h="100%">
          <HStack justifyContent="flex-start">
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
              // py={6} // ボタンの高さを調整
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
              {scenarios.length > 0 ? (
                scenarios.map((scenario) => {
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
                  シナリオはありません
                </Text>
              )}
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
