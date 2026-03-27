/**
 * @file src/renderer/src/components/ControlPanel/index.tsx
 * @description 左側に表示される開閉可能なコントロールパネルコンポーネント
 */
import React, { useRef, useState } from 'react'
import { Box, Button, Divider, Text, Tooltip, useDisclosure, useToast, VStack } from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { motion } from 'framer-motion'
import type {
  ScenarioComparisonPdfExportRequest,
  ScenarioComparisonPdfExportResponse,
  TaxSchema
} from '@myTypes/miraishi'

import {
  activeScenarioIdsAtom,
  calculatePredictionsAtom,
  createScenarioAtom,
  deleteScenarioAtom,
  filteredScenariosAtom,
  graphViewSettingsAtom,
  isControlPanelOpenAtom,
  scenariosAtom,
  searchQueryAtom,
  taxSchemaOverrideAtom
} from '@renderer/store/atoms'
import { PanelHeader } from './PanelHeader'
import { ScenarioList } from './ScenarioList'
import { DeleteScenarioDialog } from './DeleteScenarioDialog'
import { OptionMenu } from '../OptionMenu'
import { defaultTaxSchema } from '@renderer/constants/defaultTaxSchema'

const MotionButton = motion.create(Button)
const TAX_SCHEMA_LOCAL_STORAGE_KEY = 'miraishi.taxSchema.localFallback'

export function ControlPanel(): React.JSX.Element {
  const [scenariosToDisplay] = useAtom(filteredScenariosAtom)
  const [allScenarios] = useAtom(scenariosAtom)
  const createScenario = useSetAtom(createScenarioAtom)
  const deleteScenario = useSetAtom(deleteScenarioAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const setTaxSchemaOverride = useSetAtom(taxSchemaOverrideAtom)
  const [activeIds, setActiveIds] = useAtom(activeScenarioIdsAtom)
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)
  const [graphViewSettings] = useAtom(graphViewSettingsAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const toast = useToast()

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [isClickOpen, setIsClickOpen] = useState<boolean>(false)
  const [targetIdToDelete, setTargetIdToDelete] = useState<string | null>(null)
  const [isTaxRuleDialogOpen, setIsTaxRuleDialogOpen] = useState<boolean>(false)
  const [isTaxSchemaLoading, setIsTaxSchemaLoading] = useState<boolean>(false)
  const [taxSchemaForDialog, setTaxSchemaForDialog] = useState<TaxSchema | null>(null)
  const [isScenarioComparisonPdfDialogOpen, setIsScenarioComparisonPdfDialogOpen] =
    useState<boolean>(false)
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()

  const timerRef = useRef<number | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const isHoveringRef = useRef<boolean>(false)

  const clearHoverOpenTimer = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

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

  const handlePanelMouseMove = (): void => {
    isHoveringRef.current = true

    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }

    if (isOpen || isClickOpen) {
      return
    }

    if (timerRef.current === null) {
      timerRef.current = window.setTimeout(() => {
        if (isHoveringRef.current && !isClickOpen) {
          setIsOpen(true)
        }
        timerRef.current = null
      }, 200)
    }
  }

  const handleMouseLeave = (): void => {
    isHoveringRef.current = false

    clearHoverOpenTimer()

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
    clearHoverOpenTimer()
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

  const isNoHandlerRegisteredError = (error: unknown, channel: string): boolean => {
    return (
      error instanceof Error &&
      error.message.includes(`No handler registered for '${channel}'`)
    )
  }

  const loadTaxSchemaFromLocalStorage = (): TaxSchema | null => {
    try {
      const raw = window.localStorage.getItem(TAX_SCHEMA_LOCAL_STORAGE_KEY)
      if (!raw) {
        return null
      }
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') {
        return null
      }
      return parsed as TaxSchema
    } catch {
      return null
    }
  }

  const saveTaxSchemaToLocalStorage = (schema: TaxSchema): void => {
    try {
      window.localStorage.setItem(TAX_SCHEMA_LOCAL_STORAGE_KEY, JSON.stringify(schema))
    } catch {
      // localStorage 書き込み失敗時は無視（IPC保存を優先）
    }
  }

  const getTaxSchemaFromApi = async (): Promise<{
    success: boolean
    taxSchema?: TaxSchema
    error?: string
  }> => {
    const apiWithOptional = window.api as typeof window.api & {
      getTaxSchema?: () => Promise<{ success: boolean; taxSchema?: TaxSchema; error?: string }>
    }
    if (typeof apiWithOptional.getTaxSchema === 'function') {
      try {
        return await apiWithOptional.getTaxSchema()
      } catch (error) {
        if (!isNoHandlerRegisteredError(error, 'get-tax-schema')) {
          throw error
        }
      }
    }

    const fallbackInvoke = (window as any)?.electron?.ipcRenderer?.invoke
    if (typeof fallbackInvoke === 'function') {
      try {
        return await fallbackInvoke('get-tax-schema')
      } catch (error) {
        if (isNoHandlerRegisteredError(error, 'get-tax-schema')) {
          return fallbackInvoke('getTaxSchema')
        }
        throw error
      }
    }

    throw new Error('税金ルール取得APIが見つかりません。アプリ再起動後に再試行してください。')
  }

  const openTaxRuleDialog = async (): Promise<void> => {
    setIsTaxSchemaLoading(true)
    try {
      const result = await getTaxSchemaFromApi()
      if (!result.success || !result.taxSchema) {
        throw new Error(result.error ?? '税金ルールの読み込みに失敗しました。')
      }
      saveTaxSchemaToLocalStorage(result.taxSchema)
      setTaxSchemaForDialog(result.taxSchema)
      setIsTaxRuleDialogOpen(true)
    } catch (error) {
      if (
        isNoHandlerRegisteredError(error, 'get-tax-schema') ||
        isNoHandlerRegisteredError(error, 'getTaxSchema')
      ) {
        const fallbackSchema =
          loadTaxSchemaFromLocalStorage() ?? taxSchemaForDialog ?? defaultTaxSchema
        setTaxSchemaForDialog(fallbackSchema)
        setTaxSchemaOverride(fallbackSchema)
        setIsTaxRuleDialogOpen(true)
        toast({
          title: '税金ルールをローカルモードで開きました。',
          description: '取得APIが未登録のため、ローカル保存スキーマを使用しています。',
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right'
        })
        return
      }

      toast({
        title: '税金ルールの読み込みに失敗しました。',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 2500,
        isClosable: true,
        position: 'bottom-right'
      })
    } finally {
      setIsTaxSchemaLoading(false)
    }
  }

  const closeTaxRuleDialogWithoutChanges = (): void => {
    setIsTaxRuleDialogOpen(false)
  }

  const handleTaxRuleApplied = async (nextTaxSchema: TaxSchema): Promise<void> => {
    setTaxSchemaForDialog(nextTaxSchema)
    setTaxSchemaOverride(nextTaxSchema)
    saveTaxSchemaToLocalStorage(nextTaxSchema)
    await calculatePredictions()
    setIsTaxRuleDialogOpen(false)
  }

  const showInfoPlaceholder = (): void => {
    toast({
      title: 'インフォメニュー',
      description: '今後追加予定です。',
      status: 'info',
      duration: 1500,
      isClosable: true,
      position: 'bottom-right'
    })
  }

  const showCreditPlaceholder = (): void => {
    toast({
      title: 'クレジットメニュー',
      description: '今後追加予定です。',
      status: 'info',
      duration: 1500,
      isClosable: true,
      position: 'bottom-right'
    })
  }

  const handleExportScenarioComparisonPdf = async (
    payload: ScenarioComparisonPdfExportRequest
  ): Promise<void> => {
    setIsPdfExporting(true)
    try {
      const apiWithOptional = window.api as typeof window.api & {
        exportScenarioComparisonPdf?: (
          request: ScenarioComparisonPdfExportRequest
        ) => Promise<ScenarioComparisonPdfExportResponse>
      }

      if (typeof apiWithOptional.exportScenarioComparisonPdf !== 'function') {
        throw new Error('PDFエクスポートAPIが見つかりません。アプリを更新してください。')
      }

      const result = await apiWithOptional.exportScenarioComparisonPdf(payload)
      if (!result.success) {
        throw new Error(result.error ?? 'PDFエクスポートに失敗しました。')
      }

      setIsScenarioComparisonPdfDialogOpen(false)
      toast({
        title: '比較レポートPDFを出力しました。',
        description: result.filePath ? `保存先: ${result.filePath}` : undefined,
        status: 'success',
        duration: 3500,
        isClosable: true,
        position: 'bottom-right'
      })
    } catch (error) {
      toast({
        title: '比較レポートPDFの出力に失敗しました。',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3500,
        isClosable: true,
        position: 'bottom-right'
      })
    } finally {
      setIsPdfExporting(false)
    }
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
        onMouseMove={handlePanelMouseMove}
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

      <OptionMenu
        allScenarios={allScenarios}
        activeScenarioIds={activeIds}
        defaultUntilYear={graphViewSettings.predictionPeriod}
        defaultAverageOvertimeHours={graphViewSettings.averageOvertimeHours}
        isTaxRuleDialogOpen={isTaxRuleDialogOpen}
        isTaxSchemaLoading={isTaxSchemaLoading}
        initialTaxSchema={taxSchemaForDialog}
        onOpenTaxRuleDialog={(): void => {
          void openTaxRuleDialog()
        }}
        onCloseTaxRuleDialog={closeTaxRuleDialogWithoutChanges}
        onTaxRuleApplied={handleTaxRuleApplied}
        isScenarioComparisonPdfDialogOpen={isScenarioComparisonPdfDialogOpen}
        isPdfExporting={isPdfExporting}
        onOpenScenarioComparisonPdfDialog={(): void => setIsScenarioComparisonPdfDialogOpen(true)}
        onCloseScenarioComparisonPdfDialog={(): void => setIsScenarioComparisonPdfDialogOpen(false)}
        onExportScenarioComparisonPdf={handleExportScenarioComparisonPdf}
        onShowInfo={showInfoPlaceholder}
        onShowCredit={showCreditPlaceholder}
      />

      <DeleteScenarioDialog
        isOpen={isAlertOpen}
        cancelRef={cancelRef}
        onClose={onAlertClose}
        onConfirmDelete={confirmDelete}
      />

    </>
  )
}
