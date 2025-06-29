/**
 * @file src/renderer/src/components/DataView.tsx
 * @description 選択された複数シナリオをスライド形式で表示・編集するコンポーネント（スクロール終端検知・最終版）
 */
import React, { useEffect, useRef, useState, useTransition } from 'react'
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight, FaPlus, FaTrash } from 'react-icons/fa'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import {
  activeScenariosAtom,
  calculatePredictionsAtom,
  createScenarioAtom,
  graphViewSettingsAtom,
  predictionResultsAtom,
  updateScenarioAtom
} from '@renderer/store/atoms'
import type { Allowance, PredictionResult, Scenario } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { CalculationResult } from './CalculationResult'
import { FiTrendingUp } from 'react-icons/fi'

// -----------------------------------------------------------------------------
// InputView - ★修正点: コンポーネントを外部に定義
// -----------------------------------------------------------------------------
interface InputViewProps {
  scenario: Scenario
  updateNestedState: (path: string, value: any) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  addAllowance: () => void
  removeAllowance: (index: number) => void
}

const InputView = ({
                     scenario,
                     updateNestedState,
                     handleKeyDown,
                     addAllowance,
                     removeAllowance
                   }: InputViewProps): React.JSX.Element => (
  <Box h="100%" w="100%" overflowY="auto" p={{ base: 3, md: 6 }}>
    <VStack spacing={4} align="stretch">
      <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
        <Heading size="sm" mb={4}>
          給与・賞与
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm">基本給 (月額)</FormLabel>
            <NumberInput
              size="sm"
              value={scenario.initialBasicSalary ?? 0}
              onChange={(_, vN): void => updateNestedState('initialBasicSalary', isNaN(vN) ? 0 : vN)}
              min={0}
            >
              <NumberInputField placeholder="例: 300000" bg="white" onKeyDown={handleKeyDown} />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">年間ボーナス (総額)</FormLabel>
            <NumberInput
              size="sm"
              value={scenario.annualBonus ?? 0}
              onChange={(_, vN): void => updateNestedState('annualBonus', isNaN(vN) ? 0 : vN)}
              min={0}
            >
              <NumberInputField placeholder="例: 600000" bg="white" onKeyDown={handleKeyDown} />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">給与成長率 (年率 %)</FormLabel>
            <NumberInput
              size="sm"
              value={scenario.salaryGrowthRate ?? 0}
              onChange={(_, vN): void => updateNestedState('salaryGrowthRate', isNaN(vN) ? 0 : vN)}
              min={0}
              precision={1}
              step={0.1}
            >
              <NumberInputField placeholder="例: 2.5" bg="white" onKeyDown={handleKeyDown} />
            </NumberInput>
          </FormControl>
        </SimpleGrid>
      </Box>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} width="100%">
        <VStack spacing={4} align="stretch">
          <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel htmlFor={`probation-enabled-${scenario.id}`} mb="0" fontWeight="bold">
                試用期間
              </FormLabel>
              <Switch
                id={`probation-enabled-${scenario.id}`}
                isChecked={scenario.probation?.enabled ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('probation.enabled', e.target.checked)
                }
              />
            </FormControl>
            {scenario.probation?.enabled && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} pt={2}>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1}>
                    期間 (ヶ月)
                  </FormLabel>
                  <NumberInput
                    size="sm"
                    value={scenario.probation?.durationMonths ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.durationMonths', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1}>
                    基本給 (月額)
                  </FormLabel>
                  <NumberInput
                    size="sm"
                    value={scenario.probation?.basicSalary ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.basicSalary', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" mb={1}>
                    固定残業代 (月額)
                  </FormLabel>
                  <NumberInput
                    size="sm"
                    value={scenario.probation?.fixedOvertime ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('probation.fixedOvertime', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            )}
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
                isChecked={scenario.overtime?.fixedOvertime?.enabled ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('overtime.fixedOvertime.enabled', e.target.checked)
                }
              />
            </FormControl>
            {scenario.overtime?.fixedOvertime?.enabled && (
              <HStack>
                <FormControl>
                  <FormLabel fontSize="sm">金額 (月額)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={scenario.overtime?.fixedOvertime?.amount ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('overtime.fixedOvertime.amount', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">みなし時間 (h)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={scenario.overtime?.fixedOvertime?.hours ?? 0}
                    onChange={(_, vN): void =>
                      updateNestedState('overtime.fixedOvertime.hours', isNaN(vN) ? 0 : vN)
                    }
                    min={0}
                  >
                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
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
                isChecked={scenario.deductions?.dependents?.hasSpouse ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  updateNestedState('deductions.dependents.hasSpouse', e.target.checked)
                }
              />
            </HStack>
            <FormControl>
              <FormLabel fontSize="sm">扶養家族の人数</FormLabel>
              <NumberInput
                size="sm"
                value={scenario.deductions?.dependents?.numberOfDependents ?? 0}
                onChange={(_, vN): void =>
                  updateNestedState(
                    'deductions.dependents.numberOfDependents',
                    isNaN(vN) ? 0 : vN
                  )
                }
                min={0}
              >
                <NumberInputField onKeyDown={handleKeyDown} bg="white" />
              </NumberInput>
            </FormControl>
          </VStack>
        </VStack>
        <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="sm">各種手当</Heading>
            <Button leftIcon={<FaPlus />} size="xs" onClick={addAllowance}>
              追加
            </Button>
          </HStack>
          <Box
            maxHeight="300px"
            overflowY="auto"
            width="100%"
            css={{ 'scrollbar-gutter': 'stable' }}
          >
            <VStack spacing={2} align="stretch" pr={2}>
              {(scenario.allowances ?? []).map((allowance, index) => (
                <VStack
                  key={allowance.id}
                  p={3}
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="md"
                  align="stretch"
                  bg="gray.50"
                >
                  <FormControl>
                    <FormLabel fontSize="xs" mb={1}>
                      手当名
                    </FormLabel>
                    <Input
                      size="sm"
                      placeholder="例: 住宅手当"
                      value={allowance.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                        updateNestedState(`allowances.${index}.name`, e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      bg="white"
                    />
                  </FormControl>
                  <HStack flexWrap="wrap" spacing={2} alignItems="flex-end">
                    <FormControl flex="1" minW="100px">
                      <FormLabel fontSize="xs" mb={1}>
                        金額
                      </FormLabel>
                      <NumberInput
                        size="sm"
                        value={allowance.amount}
                        onChange={(_, vN): void =>
                          updateNestedState(`allowances.${index}.amount`, isNaN(vN) ? 0 : vN)
                        }
                        min={0}
                      >
                        <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                      </NumberInput>
                    </FormControl>
                    <FormControl w="auto" flexShrink={0}>
                      <FormLabel fontSize="xs" mb={1}>
                        期間
                      </FormLabel>
                      <HStack spacing={1}>
                        {allowance.duration.type !== 'unlimited' && (
                          <NumberInput
                            size="sm"
                            w="auto"
                            value={allowance.duration.value}
                            onChange={(_, vN): void =>
                              updateNestedState(
                                `allowances.${index}.duration.value`,
                                isNaN(vN) ? 0 : vN
                              )
                            }
                            min={0}
                          >
                            <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                          </NumberInput>
                        )}
                        <Select
                          size="sm"
                          w={'auto'}
                          value={allowance.duration.type}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                            updateNestedState(`allowances.${index}.duration`, {
                              type: e.target.value,
                              value: 0
                            })
                          }
                          bg="white"
                        >
                          <option value="unlimited">無期限</option>
                          <option value="years">年</option>
                          <option value="months">ヶ月</option>
                        </Select>
                      </HStack>
                    </FormControl>
                    <IconButton
                      alignSelf="flex-end"
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
          </Box>
        </VStack>
      </SimpleGrid>
    </VStack>
  </Box>
)

// -----------------------------------------------------------------------------
// ResultView - ★修正点: コンポーネントを外部に定義
// -----------------------------------------------------------------------------
interface ResultViewProps {
  predictionResult: PredictionResult | null
  predictionPeriod: number
}

const ResultView = ({
                      predictionResult,
                      predictionPeriod
                    }: ResultViewProps): React.JSX.Element => (
  <Box h="100%" w="100%" overflowY="auto" p={{ base: 3, md: 6 }}>
    {predictionResult ? (
      <CalculationResult result={predictionResult} predictionPeriod={predictionPeriod} />
    ) : (
      <Flex align="center" justify="center" h="100%">
        <Text color="gray.500">計算結果はありません。</Text>
      </Flex>
    )}
  </Box>
)

// -----------------------------------------------------------------------------
// DataViewCard
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
  const [currentView, setCurrentView] = useState<'input' | 'result'>('input')
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('down')
  const [isWheeling, setIsWheeling] = useState(false)
  const bounceRef = useRef<'top' | 'bottom' | null>(null)

  // シナリオが切り替わったら、必ず入力ビューに戻す
  useEffect((): void => {
    setEditableScenario(scenario)
    setCurrentView('input')
    bounceRef.current = null
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
          currentTarget.scrollTop + currentTarget.clientHeight >= currentTarget.scrollHeight

        if (e.deltaY > 0) {
          // 下スクロール
          if (!atBottom) {
            bounceRef.current = null
            return
          }
          if (bounceRef.current !== 'bottom') {
            bounceRef.current = 'bottom'
            return
          }
        } else if (e.deltaY < 0) {
          // 上スクロール
          if (!atTop) {
            bounceRef.current = null
            return
          }
          if (bounceRef.current !== 'top') {
            bounceRef.current = 'top'
            return
          }
        }
      }
      currentTarget = currentTarget.parentElement as HTMLElement
    }

    bounceRef.current = null // 内部スクロールがなければ常にリセット

    const handleTransition = (direction: 'up' | 'down', nextView: 'input' | 'result'): void => {
      setIsWheeling(true)
      setSlideDirection(direction)
      setCurrentView(nextView)
      setTimeout(() => setIsWheeling(false), 500) // 500msのスロットリング
    }

    const { deltaY } = e
    const canGoToResult = !!predictionResult

    // 下方向スクロール
    if (deltaY > 20) {
      if (currentView === 'input' && canGoToResult) {
        handleTransition('up', 'result')
      } else if (currentView === 'result') {
        handleTransition('up', 'input')
      }
    }
    // 上方向スクロール
    else if (deltaY < -20) {
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
            {/* ★修正点: propsを渡して外部コンポーネントを呼び出す */}
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

// -----------------------------------------------------------------------------
// ControlSection
// -----------------------------------------------------------------------------
function ControlSection(): React.JSX.Element {
  const [settings, setSettings] = useAtom(graphViewSettingsAtom)
  const [isPending, startTransition] = useTransition()
  const [tempPeriod, setTempPeriod] = useState(settings.predictionPeriod)
  const [tempOvertime, setTempOvertime] = useState(settings.averageOvertimeHours)

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
      w={'100%'}
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="white"
      spacing={{ base: 4, md: 8 }}
      flexShrink={0}
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

// --- ▲▲▲ シナリオ未選択時のウェルカムスクリーン ▲▲▲ ---
const WelcomeScreen = (): React.JSX.Element => {
  const createScenario = useSetAtom(createScenarioAtom)
  return (
    <Center w={'100%'} h="100%" p={8} bg="gray.50">
      <VStack spacing={6} textAlign="center">
        <Icon as={FiTrendingUp} boxSize={{ base: 16, md: 20 }} color="brand.accent" />
        <Heading as="h2" size="xl" color="brand.main">
          未来を見通すキャリアの瞳
        </Heading>
        <Text color="brand.darkGray">
          「
          <Text as="span" fontWeight={'bold'} color="brand.accent">
            Miraishi
          </Text>
          」へようこそ！
          <br />
          シナリオを作成して、あなたの収入が将来どのように変化するか予測してみましょう。
        </Text>
        <Button
          bg="brand.accent"
          color="white"
          _hover={{
            bg: 'teal.500',
            transform: 'scale(1.1)'
          }}
          leftIcon={<FaPlus />}
          onClick={createScenario}
          size="lg"
          mt={4}
          boxShadow="md"
          transition="all 0.15s ease-in-out"
        >
          シナリオを作成する
        </Button>
      </VStack>
    </Center>
  )
}

// -----------------------------------------------------------------------------
// DataView: 親コンポーネント
// -----------------------------------------------------------------------------
export function DataView(): React.JSX.Element {
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const [predictionResults] = useAtom(predictionResultsAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const settings = useAtomValue(graphViewSettingsAtom)
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
  }, [activeScenarios.length, calculatePredictions, settings])

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
      <ControlSection />
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

        {activeScenarios.length > 1 && (
          <HStack position="absolute" bottom={{ base: 1, md: 2 }} zIndex={1} left="50%" transform="translateX(-50%)">
            {activeScenarios.map((_, index) => (
              <Box
                key={index}
                w={2}
                h={2}
                bg={index === currentIndex ? 'brand.accent' : 'gray.300'}
                borderRadius="full"
                transition="background-color 0.2s"
              />
            ))}
          </HStack>
        )}
      </Box>
    </VStack>
  )
}
