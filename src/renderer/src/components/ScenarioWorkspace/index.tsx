/**
 * @file src/renderer/src/components/ScenarioWorkspace/index.tsx
 * @description 選択された複数シナリオをスライド形式で表示・編集する親コンポーネント
 */
import { Box, HStack, IconButton, Spinner, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useAtom, useSetAtom } from 'jotai'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import {
  activeScenariosAtom,
  calculatePredictionsAtom,
  predictionResultsAtom
} from '@renderer/store/atoms'
import { EmptyScenarioState } from './EmptyScenarioState'
import { ScenarioCard } from './ScenarioCard'

const WHEEL_SWITCH_THRESHOLD = 52
const WHEEL_SWITCH_COOLDOWN_MS = 300

type SlideDirection = 'left' | 'right'

const slideVariants: Variants = {
  initial: (direction: SlideDirection) => ({
    x: direction === 'left' ? 300 : -300,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: SlideDirection) => ({
    x: direction === 'left' ? -300 : 300,
    opacity: 0
  })
}

const isEditableElement = (element: HTMLElement | null): boolean => {
  if (!element) {
    return false
  }
  if (element.isContentEditable) {
    return true
  }
  return Boolean(element.closest('input, textarea, select, [role="textbox"], [role="spinbutton"]'))
}

export function ScenarioWorkspace(): React.JSX.Element {
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const [predictionResults] = useAtom(predictionResultsAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('left')
  const wheelDeltaAccumulatorRef = useRef<number>(0)
  const lastWheelSwitchAtRef = useRef<number>(0)

  useEffect((): void => {
    setCurrentIndex(0)
  }, [activeScenarios.map((s) => s.id).join(',')])

  useEffect((): void => {
    const recalculate = async (): Promise<void> => {
      setIsCalculating(true)
      await calculatePredictions()
      setIsCalculating(false)
    }
    if (activeScenarios.length > 0) {
      recalculate()
    } else {
      calculatePredictions()
    }
  }, [activeScenarios.length, calculatePredictions])

  const goToNext = (): void => {
    setSlideDirection('left')
    setCurrentIndex((prev) => (prev + 1) % activeScenarios.length)
  }
  const goToPrev = (): void => {
    setSlideDirection('right')
    setCurrentIndex((prev) => (prev - 1 + activeScenarios.length) % activeScenarios.length)
  }

  const canSwitchScenarioByWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>): boolean => {
      if (activeScenarios.length <= 1) {
        return false
      }

      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return false
      }

      if (isEditableElement(document.activeElement as HTMLElement | null)) {
        return false
      }

      let currentTarget = event.target as HTMLElement | null
      while (currentTarget) {
        const computedStyle = window.getComputedStyle(currentTarget)
        const canScrollY =
          ['auto', 'scroll', 'overlay'].includes(computedStyle.overflowY) &&
          currentTarget.scrollHeight > currentTarget.clientHeight + 1

        if (canScrollY) {
          const atTop = currentTarget.scrollTop <= 0
          const atBottom =
            Math.ceil(currentTarget.scrollTop + currentTarget.clientHeight) >=
            currentTarget.scrollHeight - 1

          if (event.deltaY > 0 && !atBottom) {
            return false
          }
          if (event.deltaY < 0 && !atTop) {
            return false
          }
        }

        if (currentTarget === event.currentTarget) {
          break
        }
        currentTarget = currentTarget.parentElement
      }

      return true
    },
    [activeScenarios.length]
  )

  const handleWheelScenarioSwitch = useCallback(
    (event: React.WheelEvent<HTMLDivElement>): void => {
      if (!canSwitchScenarioByWheel(event)) {
        wheelDeltaAccumulatorRef.current = 0
        return
      }

      wheelDeltaAccumulatorRef.current += event.deltaY
      if (Math.abs(wheelDeltaAccumulatorRef.current) < WHEEL_SWITCH_THRESHOLD) {
        return
      }

      const now = Date.now()
      if (now - lastWheelSwitchAtRef.current < WHEEL_SWITCH_COOLDOWN_MS) {
        wheelDeltaAccumulatorRef.current = 0
        return
      }

      event.preventDefault()

      const direction = wheelDeltaAccumulatorRef.current > 0 ? 1 : -1
      const nextSlideDirection: SlideDirection = direction > 0 ? 'right' : 'left'
      wheelDeltaAccumulatorRef.current = 0
      lastWheelSwitchAtRef.current = now
      setSlideDirection(nextSlideDirection)
      setCurrentIndex((prev) => (prev + direction + activeScenarios.length) % activeScenarios.length)
    },
    [activeScenarios.length, canSwitchScenarioByWheel]
  )

  if (activeScenarios.length === 0) {
    return <EmptyScenarioState />
  }

  const currentScenario = activeScenarios[currentIndex]
  const currentResult =
    predictionResults.find((r) => r.scenarioId === currentScenario?.id)?.result || null

  return (
    <VStack w="100%" h="100%" bg="gray.50" spacing={0}>
      <Box flex="1" w="100%" minH={0} position="relative" py={{ base: 2, md: 4, lg: 6 }} px={{ base: 4, md: 8, lg: 10 }}>
        <AnimatePresence>
          {isCalculating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <Spinner size="xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {activeScenarios.length > 1 && (
          <>
            <IconButton
              position="absolute"
              left={{ base: 1, md: 2 }}
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
              aria-label="Previous slide"
              icon={<FaChevronLeft />}
              onClick={goToPrev}
              isRound
              size="md"
              bg="white"
              boxShadow="lg"
              _hover={{ bg: 'gray.100' }}
            />
            <IconButton
              position="absolute"
              right={{ base: 1, md: 2 }}
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
              aria-label="Next slide"
              icon={<FaChevronRight />}
              onClick={goToNext}
              isRound
              size="md"
              bg="white"
              boxShadow="lg"
              _hover={{ bg: 'gray.100' }}
            />
          </>
        )}

        <Box
          w="100%"
          maxW="1760px"
          h="100%"
          mx="auto"
          position="relative"
          onWheel={handleWheelScenarioSwitch}
        >
          <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
            <motion.div
              key={currentScenario?.id || currentIndex}
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              {currentScenario && (
                <ScenarioCard scenario={currentScenario} predictionResult={currentResult} />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* 🔽 --- UI改善 --- 🔽 */}
        {activeScenarios.length > 1 && (
          <HStack
            position="absolute"
            bottom={{ base: 2, md: 3 }}
            left={{ base: 4, md: 6 }} // 中央寄せをやめて左寄せに
            transform="none" // 中央寄せのためのtransformを削除
            zIndex={1}
          >
            {activeScenarios.map((_, index) => (
              <Box
                key={index}
                w={3}
                h={3}
                bg={index === currentIndex ? 'brand.accent' : 'gray.300'}
                borderRadius="full"
                transition="background-color 0.2s"
              />
            ))}
          </HStack>
        )}
        {/* 🔼 --- UI改善 --- 🔼 */}
      </Box>
    </VStack>
  )
}
