/**
 * @file src/renderer/src/components/DataView/index.tsx
 * @description 選択された複数シナリオをスライド形式で表示・編集する親コンポーネント
 */
import React, { useEffect, useState } from 'react'
import { Box, HStack, IconButton, Spinner, VStack } from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { AnimatePresence, motion } from 'framer-motion'

import {
  activeScenariosAtom,
  calculatePredictionsAtom,
  predictionResultsAtom
} from '@renderer/store/atoms'
import { DataViewCard } from './DataViewCard'
import { WelcomeScreen } from './WelcomeScreen'

export function DataView(): React.JSX.Element {
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const [predictionResults] = useAtom(predictionResultsAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)

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
    setCurrentIndex((prev) => (prev + 1) % activeScenarios.length)
  }
  const goToPrev = (): void => {
    setCurrentIndex((prev) => (prev - 1 + activeScenarios.length) % activeScenarios.length)
  }

  if (activeScenarios.length === 0) {
    return <WelcomeScreen />
  }

  const currentScenario = activeScenarios[currentIndex]
  const currentResult =
    predictionResults.find((r) => r.scenarioId === currentScenario?.id)?.result || null

  return (
    <VStack w="100%" h="100%" bg="gray.50" spacing={0}>
      <Box flex="1" w="100%" minH={0} position="relative" p={{ base: 2, md: 4, lg: 6 }}>
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
              size="sm"
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
              size="sm"
              bg="white"
              boxShadow="lg"
              _hover={{ bg: 'gray.100' }}
            />
          </>
        )}

        <Box w="100%" h="100%" position="relative">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentScenario?.id || currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              {currentScenario && (
                <DataViewCard scenario={currentScenario} predictionResult={currentResult} />
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
                w={2.5} // 少し大きくして視認性を向上
                h={2.5}
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
