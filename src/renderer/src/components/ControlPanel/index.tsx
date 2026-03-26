/**
 * @file src/renderer/src/components/ControlPanel/index.tsx
 * @description 左側に表示される開閉可能なコントロールパネルコンポーネント
 */
import React, { useRef, useState } from 'react'
import { Box, Button, Divider, Text, Tooltip, useDisclosure, VStack } from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { motion } from 'framer-motion'

import {
  activeScenarioIdsAtom,
  createScenarioAtom,
  deleteScenarioAtom,
  filteredScenariosAtom,
  isControlPanelOpenAtom,
  searchQueryAtom
} from '@renderer/store/atoms'
import { PanelHeader } from './PanelHeader'
import { ScenarioList } from './ScenarioList'
import { DeleteScenarioDialog } from './DeleteScenarioDialog'

const MotionButton = motion.create(Button)

export function ControlPanel(): React.JSX.Element {
  const [scenariosToDisplay] = useAtom(filteredScenariosAtom)
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const [activeIds, setActiveIds] = useAtom(activeScenarioIdsAtom)
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [isClickOpen, setIsClickOpen] = useState<boolean>(false)
  const [targetIdToDelete, setTargetIdToDelete] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()

  const timerRef = useRef<number | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const isHoveringRef = useRef<boolean>(false)

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
      }
      return [...currentIds, scenarioId]
    })
  }

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
    } else if (!isClickOpen) {
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
          <PanelHeader
            isPanelOpen={isOpen}
            isSearchOpen={isSearchOpen}
            searchQuery={searchQuery}
            searchInputRef={searchInputRef}
            onTogglePanel={handleOpenClick}
            onToggleMouseEnter={handleIconButtonMouseEnter}
            onToggleMouseLeave={handleIconButtonMouseLeave}
            onOpenSearch={handleSearchClick}
            onSearchChange={setSearchQuery}
            onSearchBlur={handleSearchBlur}
            onClearSearch={handleClearSearch}
          />

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
            <ScenarioList
              scenarios={scenariosToDisplay}
              activeScenarioIds={activeIds}
              searchQuery={searchQuery}
              onSelectScenario={handleScenarioSelect}
              onRequestDeleteScenario={handleDeleteClick}
            />
          )}
        </VStack>
      </Box>

      <DeleteScenarioDialog
        isOpen={isAlertOpen}
        cancelRef={cancelRef}
        onClose={onAlertClose}
        onConfirmDelete={confirmDelete}
      />
    </>
  )
}
