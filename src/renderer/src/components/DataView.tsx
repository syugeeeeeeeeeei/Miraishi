/**
 * @file src/renderer/src/components/DataView.tsx
 * @description 選択された複数シナリオをスライド形式で表示・編集するコンポーネント
 */
import React, { useState, useEffect, useTransition } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  IconButton,
  Select,
  Switch,
  Spinner,
  NumberInput,
  NumberInputField,
  Flex,
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  Spacer
} from '@chakra-ui/react'
import { FaPlus, FaTrash, FaChartLine, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import {
  activeScenariosAtom,
  updateScenarioAtom,
  predictionResultsAtom,
  calculatePredictionsAtom,
  isGraphViewVisibleAtom,
  graphViewSettingsAtom
} from '@renderer/store/atoms'
import type { Scenario, Allowance, PredictionResult } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { CalculationResult } from './CalculationResult'

// -----------------------------------------------------------------------------
// DataViewCard
// (このコンポーネントは変更ありません)
// -----------------------------------------------------------------------------
interface DataViewCardProps {
  scenario: Scenario
  predictionResult: PredictionResult | null
}

function DataViewCard({ scenario, predictionResult }: DataViewCardProps): React.JSX.Element {
  const updateScenario = useSetAtom(updateScenarioAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [editableScenario, setEditableScenario] = useState<Scenario>(scenario)
  const toast = useToast()
  const graphViewSettings = useAtomValue(graphViewSettingsAtom)

  useEffect((): void => {
    setEditableScenario(scenario)
  }, [scenario])

  const updateNestedState = (path: string, value: any): void => {
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
  }

  const handleSaveAndRecalculate = (): void => {
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
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSaveAndRecalculate()
      e.currentTarget.blur()
    }
  }

  const addAllowance = (): void => {
    const newAllowance: Allowance = {
      id: uuidv4(),
      name: '新規手当',
      type: 'fixed',
      amount: 10000,
      duration: { type: 'unlimited' }
    }
    const currentAllowances = editableScenario.allowances ?? []
    setEditableScenario((prev) => ({ ...prev, allowances: [...currentAllowances, newAllowance] }))
  }

  const removeAllowance = (index: number): void => {
    const currentAllowances = editableScenario.allowances ?? []
    setEditableScenario((prev) => ({
      ...prev,
      allowances: currentAllowances.filter((_, i) => i !== index)
    }))
  }

  return (
    <Box
      key={scenario.id}
      h="100%"
      bg="brand.base"
      borderRadius="lg"
      boxShadow="md"
      display="flex"
      flexDirection="column"
      onBlur={(e: React.FocusEvent<HTMLDivElement>): void => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleSaveAndRecalculate()
        }
      }}
    >
      <HStack
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        justifyContent="space-between"
        flexShrink={0}
      >
        <Input
          variant="flushed"
          fontWeight="bold"
          fontSize="lg"
          placeholder="シナリオ名"
          value={editableScenario.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            updateNestedState('title', e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </HStack>

      <Box flex="1" overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <Heading size="sm">給与・賞与</Heading>
            <FormControl>
              <FormLabel fontSize="sm">基本給 (月額)</FormLabel>
              <NumberInput
                size="sm"
                value={editableScenario.initialBasicSalary ?? 0}
                onChange={(_, vN): void =>
                  updateNestedState('initialBasicSalary', isNaN(vN) ? 0 : vN)
                }
                min={0}
              >
                <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 300000" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">年間ボーナス (総額)</FormLabel>
              <NumberInput
                size="sm"
                value={editableScenario.annualBonus ?? 0}
                onChange={(_, vN): void => updateNestedState('annualBonus', isNaN(vN) ? 0 : vN)}
                min={0}
              >
                <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 600000" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">給与成長率 (年率 %)</FormLabel>
              <NumberInput
                size="sm"
                value={editableScenario.salaryGrowthRate ?? 0}
                onChange={(_, vN): void =>
                  updateNestedState('salaryGrowthRate', isNaN(vN) ? 0 : vN)
                }
                min={0}
                precision={1}
                step={0.1}
              >
                <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 2.5" />
              </NumberInput>
            </FormControl>
          </VStack>

          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel htmlFor={`probation-enabled-${scenario.id}`} mb="0" fontWeight="bold">
                試用期間
              </FormLabel>
              <Switch
                id={`probation-enabled-${scenario.id}`}
                isChecked={editableScenario.probation?.enabled ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('probation.enabled', e.target.checked)
                }
              />
            </FormControl>
            {editableScenario.probation?.enabled && (
              <VStack spacing={3} align="stretch" pt={2}>
                <FormControl>
                  <FormLabel fontSize="sm">期間 (ヶ月)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.probation?.durationMonths ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.durationMonths', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">期間中の基本給 (月額)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.probation?.basicSalary ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.basicSalary', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">期間中の固定残業代 (月額)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.probation?.fixedOvertime ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.fixedOvertime', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                </FormControl>
              </VStack>
            )}
          </VStack>

          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <HStack justifyContent="space-between">
              <Heading size="sm">各種手当</Heading>
              <Button leftIcon={<FaPlus />} size="xs" onClick={addAllowance}>
                追加
              </Button>
            </HStack>
            {(editableScenario.allowances ?? []).map((allowance, index) => (
              <VStack
                key={allowance.id}
                p={2}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="md"
                align="stretch"
              >
                <Input
                  size="sm"
                  placeholder="手当名"
                  value={allowance.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateNestedState(`allowances.${index}.name`, e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
                <HStack>
                  <NumberInput
                    size="sm"
                    w="100%"
                    value={allowance.amount}
                    onChange={(_, vN): void =>
                      updateNestedState(`allowances.${index}.amount`, isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                  <Select
                    size="sm"
                    w="120px"
                    value={allowance.duration.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                      updateNestedState(`allowances.${index}.duration`, {
                        type: e.target.value,
                        value: 0
                      })
                    }
                  >
                    <option value="unlimited">無期限</option>
                    <option value="years">年</option>
                  </Select>
                  {allowance.duration.type === 'years' && (
                    <NumberInput
                      size="sm"
                      w="80px"
                      value={allowance.duration.value}
                      onChange={(_, vN): void =>
                        updateNestedState(`allowances.${index}.duration.value`, isNaN(vN) ? 0 : vN)
                      }
                      min={0}
                    >
                      <NumberInputField onKeyDown={handleKeyDown} />
                    </NumberInput>
                  )}
                  <IconButton
                    size="sm"
                    aria-label="Delete allowance"
                    icon={<FaTrash />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={(): void => removeAllowance(index)}
                  />
                </HStack>
              </VStack>
            ))}
          </VStack>

          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <Heading size="sm">固定残業代</Heading>
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel htmlFor={`fixed-overtime-${scenario.id}`} mb="0" fontSize="sm">
                固定残業代制度
              </FormLabel>
              <Switch
                id={`fixed-overtime-${scenario.id}`}
                size="sm"
                isChecked={editableScenario.overtime?.fixedOvertime?.enabled ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('overtime.fixedOvertime.enabled', e.target.checked)
                }
              />
            </FormControl>
            {editableScenario.overtime?.fixedOvertime?.enabled && (
              <HStack>
                <FormControl>
                  <FormLabel fontSize="sm">金額 (月額)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.overtime?.fixedOvertime?.amount ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('overtime.fixedOvertime.amount', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">みなし時間 (h)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.overtime?.fixedOvertime?.hours ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('overtime.fixedOvertime.hours', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} />
                  </NumberInput>
                </FormControl>
              </HStack>
            )}
          </VStack>

          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <Heading size="sm">扶養・控除</Heading>
            <HStack justifyContent="space-between">
              <FormLabel htmlFor={`has-spouse-${scenario.id}`} mb="0" fontSize="sm">
                配偶者の有無
              </FormLabel>
              <Switch
                id={`has-spouse-${scenario.id}`}
                size="sm"
                isChecked={editableScenario.deductions?.dependents?.hasSpouse ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('deductions.dependents.hasSpouse', e.target.checked)
                }
              />
            </HStack>
            <FormControl>
              <FormLabel fontSize="sm">扶養家族の人数</FormLabel>
              <NumberInput
                size="sm"
                value={editableScenario.deductions?.dependents?.numberOfDependents ?? 0}
                onChange={(_, vN): void =>
                  updateNestedState('deductions.dependents.numberOfDependents', isNaN(vN) ? 0 : vN)
                }
                min={0}
              >
                <NumberInputField onKeyDown={handleKeyDown} />
              </NumberInput>
            </FormControl>
          </VStack>

          {predictionResult && (
            <CalculationResult
              result={predictionResult}
              predictionPeriod={graphViewSettings.predictionPeriod}
            />
          )}
        </VStack>
      </Box>
    </Box>
  )
}

// -----------------------------------------------------------------------------
// ControlSection
// -----------------------------------------------------------------------------
function ControlSection(): React.JSX.Element {
  const [settings, setSettings] = useAtom(graphViewSettingsAtom)
  const [isPending, startTransition] = useTransition()

  // 🔽 ----- ローカルStateを追加 ----- 🔽
  const [tempPeriod, setTempPeriod] = useState(settings.predictionPeriod)
  const [tempOvertime, setTempOvertime] = useState(settings.averageOvertimeHours)

  // グローバルな設定が外部から変更された場合に、ローカルの表示も同期させる
  useEffect(() => {
    setTempPeriod(settings.predictionPeriod)
    setTempOvertime(settings.averageOvertimeHours)
  }, [settings.predictionPeriod, settings.averageOvertimeHours])

  const handleSliderChangeEnd = (type: 'period' | 'overtime', value: number): void => {
    startTransition(() => {
      if (type === 'period') {
        setSettings({ ...settings, predictionPeriod: value })
      } else {
        setSettings({ ...settings, averageOvertimeHours: value })
      }
    })
  }

  return (
    <HStack
      p={4}
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="white"
      spacing={8}
      opacity={isPending ? 0.7 : 1}
      pointerEvents={isPending ? 'none' : 'auto'}
    >
      <FormControl>
        <FormLabel fontSize="sm" mb={1}>
          計算期間: <Badge colorScheme="teal">{tempPeriod}年</Badge>
        </FormLabel>
        <Slider
          value={tempPeriod}
          onChange={(val) => setTempPeriod(val)}
          onChangeEnd={(val) => handleSliderChangeEnd('period', val)}
          min={1}
          max={50}
          step={1}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="sm" mb={1}>
          月平均の残業時間: <Badge colorScheme="orange">{tempOvertime}時間</Badge>
        </FormLabel>
        <Slider
          value={tempOvertime}
          onChange={(val) => setTempOvertime(val)}
          onChangeEnd={(val) => handleSliderChangeEnd('overtime', val)}
          min={0}
          max={100}
          step={1}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>
    </HStack>
  )
}

// -----------------------------------------------------------------------------
// DataView: 親コンポーネント
// -----------------------------------------------------------------------------
export function DataView(): React.JSX.Element {
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const [predictionResults] = useAtom(predictionResultsAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const setIsGraphViewVisible = useSetAtom(isGraphViewVisibleAtom)
  const settings = useAtomValue(graphViewSettingsAtom)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [leftHovering, setLeftHovering] = useState<boolean>(false)
  const [rightHovering, setRightHovering] = useState<boolean>(false)

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
  }, [activeScenarios.map((s) => s.id).join(','), settings])

  const goToNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % activeScenarios.length)
  }
  const goToPrev = (): void => {
    setCurrentIndex((prev) => (prev - 1 + activeScenarios.length) % activeScenarios.length)
  }

  if (activeScenarios.length === 0) {
    return (
      <Box flex="1" p={8} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Heading size="lg" color="brand.darkGray">
            シナリオを選択してください
          </Heading>
          <Text mt={2}>左のパネルからシナリオを選択するか、新規作成してください。</Text>
        </VStack>
      </Box>
    )
  }

  const currentScenario = activeScenarios[currentIndex]
  const currentResult =
    predictionResults.find((r) => r.scenarioId === currentScenario?.id)?.result || null

  return (
    <Box flex="1" h="100vh" display="flex" flexDirection="column" bg="gray.50">
      <HStack
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="brand.base"
        justifyContent="flex-end"
        spacing={4}
      >
        <Heading size="md" color="brand.accent" fontWeight="bold">
          Miraishi
        </Heading>
        <Spacer />
        <Button
          leftIcon={<FaChartLine />}
          colorScheme="purple"
          onClick={(): void => setIsGraphViewVisible(true)}
          size="sm"
          isDisabled={predictionResults.length === 0}
        >
          グラフ表示
        </Button>
      </HStack>

      <ControlSection />

      <Flex
        flex="1"
        w="100%"
        h="100%"
        overflow="hidden"
        position="relative"
        alignItems="center"
        justifyContent="center"
      >
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

        {!isCalculating && activeScenarios.length > 1 && (
          <>
            <Box
              position="absolute"
              left={0}
              top={0}
              w="15%"
              h="100%"
              zIndex={2}
              onMouseEnter={(): void => setLeftHovering(true)}
              onMouseLeave={(): void => setLeftHovering(false)}
            >
              <motion.div
                style={{ pointerEvents: leftHovering ? 'auto' : 'none' }}
                animate={{ opacity: leftHovering ? 1 : 0 }}
                transition={{ duration: 0.1 }}
              >
                <IconButton
                  aria-label="Previous slide"
                  icon={<FaChevronLeft />}
                  onClick={goToPrev}
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  isRound
                />
              </motion.div>
            </Box>
            <Box
              position="absolute"
              right={0}
              top={0}
              w="15%"
              h="100%"
              zIndex={2}
              onMouseEnter={(): void => setRightHovering(true)}
              onMouseLeave={(): void => setRightHovering(false)}
            >
              <motion.div
                style={{ pointerEvents: rightHovering ? 'auto' : 'none' }}
                animate={{ opacity: rightHovering ? 1 : 0 }}
                transition={{ duration: 0.1 }}
              >
                <IconButton
                  aria-label="Next slide"
                  icon={<FaChevronRight />}
                  onClick={goToNext}
                  position="absolute"
                  right={4}
                  top="50%"
                  transform="translateY(-50%)"
                  isRound
                />
              </motion.div>
            </Box>
          </>
        )}

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentScenario?.id || currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', padding: '16px' }}
          >
            {currentScenario && (
              <DataViewCard scenario={currentScenario} predictionResult={currentResult} />
            )}
          </motion.div>
        </AnimatePresence>

        {activeScenarios.length > 1 && (
          <HStack position="absolute" top={4} zIndex={1}>
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
      </Flex>
    </Box>
  )
}
