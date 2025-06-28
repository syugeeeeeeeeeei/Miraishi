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
const MotionButton = motion(Button)

export function ControlPanel(): React.JSX.Element {
  const [scenarios] = useAtom(scenariosAtom)
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const [activeIds, setActiveIds] = useAtom(activeScenarioIdsAtom)
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)

  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [targetIdToDelete, setTargetIdToDelete] = useState<string | null>(null)

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

  return (
    <>
      <Box
        w={isOpen ? '300px' : '60px'} // 幅を広げる
        h="100vh"
        bg="brand.white"
        p={4} // 余白を調整
        boxShadow="lg" // 影を少し強く
        zIndex={10}
        transition="width 0.3s ease-in-out" // アニメーションを滑らかに
        flexShrink={0}
      >
        <VStack align="stretch" spacing={4} h="100%">
          <HStack justifyContent="flex-end">
            <IconButton
              aria-label="Toggle Panel"
              icon={isOpen ? <FaAngleLeft /> : <FaAngleRight />}
              variant="ghost"
              onClick={(): void => setIsOpen(!isOpen)}
            />
          </HStack>

          <Tooltip label="新規シナリオ作成" isDisabled={isOpen} placement="right">
            <MotionButton
              colorScheme="teal"
              bg="brand.accent"
              color="white"
              onClick={handleCreateNewScenario}
              justifyContent={isOpen ? 'flex-start' : 'center'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              py={6} // ボタンの高さを調整
            >
              <FaPlus />
              {isOpen && <Text ml={3}>新しいシナリオ</Text>}
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
