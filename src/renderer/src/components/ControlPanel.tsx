/**
 * @file src/renderer/src/components/ControlPanel.tsx
 * @description 左側に表示される開閉可能なコントロールパネルコンポーネント
 */
import React, { useRef, useState } from 'react'
import {
  Box,
  VStack,
  Heading,
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
  Tooltip
} from '@chakra-ui/react'
import { FaTrash, FaPlus, FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import {
  scenariosAtom,
  createScenarioAtom,
  activeScenarioIdAtom,
  deleteScenarioAtom,
  isControlPanelOpenAtom
} from '@renderer/store/atoms'

export function ControlPanel(): React.JSX.Element {
  const [scenarios] = useAtom(scenariosAtom)
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const [activeId, setActiveId] = useAtom(activeScenarioIdAtom)
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

  return (
    <>
      <Box
        w={isOpen ? '250px' : '60px'}
        h="100vh"
        bg="brand.white"
        p={2}
        boxShadow="md"
        zIndex={10}
        transition="width 0.2s"
      >
        <VStack align="stretch" spacing={4}>
          <HStack justifyContent={isOpen ? 'space-between' : 'center'}>
            {isOpen && (
              <Heading size="md" color="brand.main" pl={2} noOfLines={1}>
                コントロール
              </Heading>
            )}
            <IconButton
              aria-label="Toggle Panel"
              icon={isOpen ? <FaAngleLeft /> : <FaAngleRight />}
              variant="ghost"
              onClick={(): void => setIsOpen(!isOpen)}
            />
          </HStack>

          <Tooltip label="新規シナリオ作成" isDisabled={isOpen} placement="right">
            <Button
              colorScheme="teal"
              variant="solid"
              bg="brand.accent"
              onClick={handleCreateNewScenario}
              justifyContent={isOpen ? 'flex-start' : 'center'}
            >
              <FaPlus />
              {isOpen && (
                <Text ml={2} noOfLines={1}>
                  新規作成
                </Text>
              )}
            </Button>
          </Tooltip>

          {/* 🔽 ----- ここから修正 ----- 🔽 */}
          {/* パネルが開いている時のみシナリオリスト全体を描画する */}
          {isOpen && (
            <Box>
              <Heading size="sm" mt={4} mb={2} noOfLines={1}>
                保存されたシナリオ
              </Heading>
              {scenarios.length > 0 ? (
                scenarios.map((scenario) => (
                  <HStack key={scenario.id} w="100%">
                    <Button
                      variant={activeId === scenario.id ? 'solid' : 'ghost'}
                      colorScheme={activeId === scenario.id ? 'teal' : 'gray'}
                      bg={activeId === scenario.id ? 'brand.accent' : 'transparent'}
                      color={activeId === scenario.id ? 'white' : 'inherit'}
                      flex="1"
                      justifyContent="flex-start"
                      onClick={(): void => setActiveId(scenario.id)}
                      _hover={{
                        bg: activeId !== scenario.id ? 'gray.100' : 'brand.accent'
                      }}
                    >
                      <Text noOfLines={1}>{scenario.title}</Text>
                    </Button>
                    <IconButton
                      aria-label="Delete scenario"
                      icon={<FaTrash />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={(): void => handleDeleteClick(scenario.id)}
                    />
                  </HStack>
                ))
              ) : (
                <Text fontSize="sm" color="brand.darkGray">
                  シナリオはありません
                </Text>
              )}
            </Box>
          )}
          {/* 🔼 ----- ここまで修正 ----- 🔼 */}
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
