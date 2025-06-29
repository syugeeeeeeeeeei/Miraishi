/**
 * @file src/renderer/src/components/DataView/DataViewCard.tsx
 * @description 入力ビューと結果ビューを切り替えるカードUIのコンテナ
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Flex, Input, useToast } from '@chakra-ui/react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  calculatePredictionsAtom,
  graphViewSettingsAtom,
  updateScenarioAtom
} from '@renderer/store/atoms'
import type { Allowance, PredictionResult, Scenario } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { InputView } from './InputView'
import { ResultView } from './ResultView'

interface DataViewCardProps {
  scenario: Scenario
  predictionResult: PredictionResult | null
}

export function DataViewCard({ scenario, predictionResult }: DataViewCardProps): React.JSX.Element {
  const updateScenario = useSetAtom(updateScenarioAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [editableScenario, setEditableScenario] = useState<Scenario>(scenario)
  const toast = useToast()
  const graphViewSettings = useAtomValue(graphViewSettingsAtom)
  const [currentView, setCurrentView] = useState<'input' | 'result'>('input')
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('down')
  const [isWheeling, setIsWheeling] = useState(false)

  useEffect((): void => {
    setEditableScenario(scenario)
    setCurrentView('input')
  }, [scenario])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    if (isWheeling) {
      e.stopPropagation()
      return
    }

    let currentTarget = e.target as HTMLElement
    while (currentTarget && currentTarget !== e.currentTarget) {
      const isScrollable = currentTarget.scrollHeight > currentTarget.clientHeight
      if (isScrollable) {
        const atTop = currentTarget.scrollTop === 0
        const atBottom =
          Math.ceil(currentTarget.scrollTop + currentTarget.clientHeight) >= currentTarget.scrollHeight

        if (e.deltaY > 0 && !atBottom) return
        if (e.deltaY < 0 && !atTop) return
      }
      currentTarget = currentTarget.parentElement as HTMLElement
    }

    const handleTransition = (direction: 'up' | 'down', nextView: 'input' | 'result'): void => {
      setIsWheeling(true)
      setSlideDirection(direction)
      setCurrentView(nextView)
      setTimeout(() => setIsWheeling(false), 500)
    }

    const { deltaY } = e
    const canGoToResult = !!predictionResult && predictionResult.details.length > 0;

    if (deltaY > 20) {
      if (currentView === 'input' && canGoToResult) {
        handleTransition('up', 'result')
      } else if (currentView === 'result') {
        handleTransition('up', 'input')
      }
    } else if (deltaY < -20) {
      if (currentView === 'result') {
        handleTransition('down', 'input')
      } else if (currentView === 'input' && canGoToResult) {
        handleTransition('down', 'result')
      }
    }
  }

  const slideVariants: Variants = {
    initial: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exit: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    })
  }

  const updateNestedState = useCallback((path: string, value: any): void => {
    setEditableScenario((prev) => {
      const keys = path.split('.')
      const newState = JSON.parse(JSON.stringify(prev))
      let current = newState
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newState
    })
  }, [])

  const handleSaveAndRecalculate = useCallback((): void => {
    if (JSON.stringify(editableScenario) !== JSON.stringify(scenario)) {
      updateScenario(editableScenario)
      calculatePredictions()
      toast({
        title: '自動保存・再計算が実行されました。',
        description: `「${editableScenario.title}」の変更が反映されました。`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    }
  }, [editableScenario, scenario, updateScenario, calculatePredictions, toast])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  const addAllowance = useCallback((): void => {
    const newAllowance: Allowance = {
      id: uuidv4(),
      name: '新規手当',
      type: 'fixed',
      amount: 10000,
      duration: { type: 'unlimited' }
    }
    setEditableScenario((prev) => ({
      ...prev,
      allowances: [...(prev.allowances ?? []), newAllowance]
    }))
  }, [])

  const removeAllowance = useCallback((index: number): void => {
    setEditableScenario((prev) => ({
      ...prev,
      allowances: (prev.allowances ?? []).filter((_, i) => i !== index)
    }))
  }, [])

  return (
    <Flex
      h="100%"
      w="100%"
      bg="brand.base"
      borderRadius="lg"
      boxShadow="lg"
      flexDirection="column"
      onBlur={(e: React.FocusEvent<HTMLDivElement>): void => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleSaveAndRecalculate()
        }
      }}
    >
      <Box p={4} borderBottom="1px solid" borderColor="gray.300" flexShrink={0} bg="brand.darkBase">
        <Input
          variant="flushed"
          fontWeight="bold"
          fontSize="2xl"
          placeholder="シナリオ名"
          w={{ base: '100%', md: '75%', lg: '50%' }}
          borderBottomColor="gray.400"
          _hover={{ borderColor: 'gray.600' }}
          _focus={{ borderColor: 'brand.accent' }}
          value={editableScenario.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            updateNestedState('title', e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </Box>

      <Box flex="1" minH={0} position="relative" overflow="hidden" onWheel={handleWheel}>
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.div
            key={currentView}
            custom={slideDirection}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              height: '100%',
              position: 'absolute',
              width: '100%',
              willChange: 'transform, opacity'
            }}
          >
            {currentView === 'input' ? (
              <InputView
                scenario={editableScenario}
                updateNestedState={updateNestedState}
                handleKeyDown={handleKeyDown}
                addAllowance={addAllowance}
                removeAllowance={removeAllowance}
              />
            ) : (
              <ResultView
                predictionResult={predictionResult}
                predictionPeriod={graphViewSettings.predictionPeriod}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  )
}
