/**
 * @file src/renderer/src/components/DataView.tsx
 * @description 選択された複数シナリオをスライド形式で表示・編集するコンポーネント
 */
import React, { useState, useEffect, useTransition, useRef } from 'react'
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
  Spacer,
  SimpleGrid
} from '@chakra-ui/react'
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa' // FaChartLine, Image のインポートを削除
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import {
  activeScenariosAtom,
  updateScenarioAtom,
  predictionResultsAtom,
  calculatePredictionsAtom,
  graphViewSettingsAtom
} from '@renderer/store/atoms'
import type { Scenario, Allowance, PredictionResult } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { CalculationResult } from './CalculationResult'

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

  // 🔽 追加：画面切り替え用のステートとRef
  const [currentScreen, setCurrentScreen] = useState(0) // 0:入力画面, 1:計算結果画面
  const scrollContainerRef = useRef<HTMLDivElement>(null) // スクロール領域の参照
  // 🔼

  useEffect((): void => {
    setEditableScenario(scenario)
    // シナリオが変更されたら入力画面にリセット
    setCurrentScreen(0)
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

  // 🔽 追加：画面切り替えハンドラー
  const handleNextScreen = (): void => {
    if (currentScreen < 1) { // 2画面しかないので最大1
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handlePrevScreen = (): void => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }
  // 🔼

  return (
    <Box
      key={scenario.id}
      h="85%"
      bg="brand.base"
      borderRadius="lg"
      boxShadow="md"
      display="flex"
      mt={4}
      mx={20}
      flexDirection="column"
      onBlur={(e: React.FocusEvent<HTMLDivElement>): void => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleSaveAndRecalculate()
        }
      }}
    >
      <Box
        p={4}
        bg={'brand.darkBase'}
        roundedTop={'lg'}
        borderColor="gray.200"
        justifyContent="space-between"
        flexShrink={0}
      >
        <Input
          variant="flushed"
          fontWeight="bold"
          fontSize="2xl"
          placeholder="シナリオ名"
          w="50%"
          borderBottomWidth="2px"
          borderBottomColor="gray.300"
          value={editableScenario.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            updateNestedState('title', e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </Box>

      {/* 🔽 変更点：画面切り替え用のスクロールコンテナ（framer-motionでy座標を制御） */}
      <Box
        ref={scrollContainerRef}
        flex="1" // 残りの高さを全て占める
        p={4}
        overflowY="hidden" // ユーザーによるスクロールを無効化
        // scrollSnapType は不要
        // css は残しておく（scrollbar-gutterのため）
        css={{
          'scrollbar-gutter': 'stable'
        }}
      >
        <motion.div
          animate={{ y: `-${currentScreen * 100}%` }} // currentScreen に応じてY軸を移動
          transition={{ ease: 'easeInOut', duration: 0.3 }} // アニメーションの速度とイージング
          style={{ height: '100%' }} // 親のBoxの高さを継承
        >
          {/* 画面1: データ入力フォーム群 */}
          <Box height="100%" flexShrink={0} pb={4} pr={4}> {/* 🔽 padding-bottom と padding-right を追加してスクロールバー分のスペースを確保 */}
            <VStack spacing={4} align="stretch" h="100%"> {/* 🔽 height="100%" を追加 */}
              {/* 給与・賞与セクション */}
              <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                <Heading size="sm" mb={4}>
                  給与・賞与
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
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
                      <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 300000" bg="white" />
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
                      <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 600000" bg="white" />
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
                      <NumberInputField onKeyDown={handleKeyDown} placeholder="例: 2.5" bg="white" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* 新しいレイアウト：試用期間、固定残業代、扶養・控除 (左) と 各種手当 (右) */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                {/* 左カラム: 試用期間、固定残業代、扶養・控除 */}
                <VStack spacing={4} align="stretch">
                  {/* 試用期間セクション */}
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
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} pt={2}>
                        <FormControl alignItems="flex-start">
                          <FormLabel fontSize="sm" mb={1}>
                            期間 (ヶ月)
                          </FormLabel>
                          <NumberInput
                            size="sm"
                            value={editableScenario.probation?.durationMonths ?? 0}
                            onChange={(_, vN): void =>
                              updateNestedState('probation.durationMonths', isNaN(vN) ? 0 : vN)
                            }
                            min={0}
                          >
                            <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                          </NumberInput>
                        </FormControl>
                        <FormControl alignItems="flex-start">
                          <FormLabel fontSize="sm" mb={1}>
                            基本給 (月額)
                          </FormLabel>
                          <NumberInput
                            size="sm"
                            value={editableScenario.probation?.basicSalary ?? 0}
                            onChange={(_, vN): void =>
                              updateNestedState('probation.basicSalary', isNaN(vN) ? 0 : vN)
                            }
                            min={0}
                          >
                            <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                          </NumberInput>
                        </FormControl>
                        <FormControl alignItems="flex-start">
                          <FormLabel fontSize="sm" mb={1}>
                            固定残業代 (月額)
                          </FormLabel>
                          <NumberInput
                            size="sm"
                            value={editableScenario.probation?.fixedOvertime ?? 0}
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

                  {/* 固定残業代セクション */}
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
                            <NumberInputField onKeyDown={handleKeyDown} bg="white" />
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
                            <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                          </NumberInput>
                        </FormControl>
                      </HStack>
                    )}
                  </VStack>

                  {/* 扶養・控除セクション */}
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
                        <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </VStack>

                {/* 右カラム: 各種手当 */}
                <VStack spacing={3} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
                  <HStack justifyContent="space-between" mb={2}>
                    <Heading size="sm">各種手当</Heading>
                    <Button leftIcon={<FaPlus />} size="xs" onClick={addAllowance}>
                      追加
                    </Button>
                  </HStack>
                  <Box
                    maxHeight="250px"
                    overflowY="auto"
                    width="100%"
                    css={{
                      'scrollbar-gutter': 'stable'
                    }}
                  >
                    <VStack spacing={2} align="stretch">
                      {(editableScenario.allowances ?? []).map((allowance, index) => (
                        <VStack
                          key={allowance.id}
                          p={2}
                          border="1px solid"
                          borderColor="gray.100"
                          borderRadius="md"
                          align="stretch"
                          bg="gray.50"
                        >
                          <FormControl>
                            <FormLabel fontSize="sm" mb={1}>
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
                          <HStack flexWrap="wrap" spacing={2} alignItems="flex-start">
                            <FormControl flex="1" minW="100px">
                              <FormLabel fontSize="sm" mb={1}>
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
                              <FormLabel fontSize="sm" mb={1}>
                                期間
                              </FormLabel>
                              <HStack spacing={1}>
                                <Select
                                  size="sm"
                                  w="auto"
                                  minW="60px"
                                  value={allowance.duration.type}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                                    updateNestedState(`allowances.${index}.duration`, {
                                      type: e.target.value,
                                      value: 0
                                    })
                                  }
                                  bg="white"
                                  flexShrink={0}
                                >
                                  <option value="unlimited">無期限</option>
                                  <option value="years">年</option>
                                  <option value="months">ヶ月</option>
                                </Select>
                                {allowance.duration.type === 'years' && (
                                  <NumberInput
                                    size="sm"
                                    w="auto"
                                    minW="50px"
                                    maxW="70px"
                                    value={allowance.duration.value}
                                    onChange={(_, vN): void =>
                                      updateNestedState(`allowances.${index}.duration.value`, isNaN(vN) ? 0 : vN)
                                    }
                                    min={0}
                                  >
                                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                                  </NumberInput>
                                )}
                                {allowance.duration.type === 'months' && (
                                  <NumberInput
                                    size="sm"
                                    w="auto"
                                    minW="50px"
                                    maxW="70px"
                                    value={allowance.duration.value}
                                    onChange={(_, vN): void =>
                                      updateNestedState(`allowances.${index}.duration.value`, isNaN(vN) ? 0 : vN)
                                    }
                                    min={0}
                                  >
                                    <NumberInputField onKeyDown={handleKeyDown} bg="white" />
                                  </NumberInput>
                                )}
                              </HStack>
                            </FormControl>

                            <IconButton
                              size="sm"
                              aria-label="Delete allowance"
                              icon={<FaTrash />}
                              variant="ghost"
                              colorScheme="red"
                              onClick={(): void => removeAllowance(index)}
                              flexShrink={0}
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

          {/* 画面2: 計算結果 */}
          {predictionResult && (
            <Box height="100%" flexShrink={0} mt={4}> {/* 🔽 mt={4} を追加して画面間の間隔を確保 */}
              <CalculationResult
                result={predictionResult}
                predictionPeriod={graphViewSettings.predictionPeriod}
              />
            </Box>
          )}
        </motion.div>
      </Box>
      {/* 🔼 画面切り替え用のスクロールコンテナここまで */}

      {/* 🔽 追加：画面切り替え用のナビゲーションボタン */}
      <HStack justifyContent="center" py={2} borderTop="1px solid" borderColor="gray.200" flexShrink={0}>
        <Button onClick={handlePrevScreen} isDisabled={currentScreen === 0} size="sm">
          戻る
        </Button>
        <Text>{currentScreen === 0 ? '入力' : '結果'}</Text>
        <Button onClick={handleNextScreen} isDisabled={currentScreen === 1} size="sm">
          次へ
        </Button>
      </HStack>
      {/* 🔼 */}
    </Box>
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
  // const setIsGraphViewVisible = useSetAtom(isGraphViewVisibleAtom) // App.tsx に移動
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
    <Box flex="1" h="100%" display="flex" flexDirection="column" bg="gray.50">
      {' '}
      {/* h="100vh" を h="100%" に修正 */}
      {/* 以前のヘッダー部分はApp.tsxに移動しました */}
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

        {activeScenarios.length > 1 && (
          <>
            <IconButton
              position="absolute"
              left={4}
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
              _hover={{ bg: 'gray.50' }}
            />

            <IconButton
              position="absolute"
              right={4}
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
              _hover={{ bg: 'gray.50' }}
            />
          </>
        )}

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentScenario?.id || currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
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
