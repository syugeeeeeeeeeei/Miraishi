/**
 * @file src/renderer/src/components/DataView.tsx
 * @description 選択された複数シナリオを横並びで表示・編集するコンポーネント
 */
import React, { useState, useEffect } from 'react'
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
  Spacer // Spacerをインポート
} from '@chakra-ui/react'
import { FaPlus, FaTrash, FaChartLine } from 'react-icons/fa'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
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
// -----------------------------------------------------------------------------
interface DataViewCardProps {
  scenario: Scenario
  predictionResult: PredictionResult | null
  styleProps: object
}

function DataViewCard({
  scenario,
  predictionResult,
  styleProps
}: DataViewCardProps): React.JSX.Element {
  const updateScenario = useSetAtom(updateScenarioAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [editableScenario, setEditableScenario] = useState<Scenario>(scenario)
  const toast = useToast()
  const graphViewSettings = useAtomValue(graphViewSettingsAtom)

  useEffect(() => {
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
      h="100%"
      bg="brand.base"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      {...styleProps}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleSaveAndRecalculate()
        }
      }}
    >
      <HStack p={4} borderBottom="1px solid" borderColor="gray.200" justifyContent="space-between">
        <Input
          variant="flushed"
          fontWeight="bold"
          fontSize="lg"
          placeholder="シナリオ名"
          value={editableScenario.title}
          onChange={(e) => updateNestedState('title', e.target.value)}
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
                onChange={(_, vN) => updateNestedState('initialBasicSalary', isNaN(vN) ? 0 : vN)}
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
                onChange={(_, vN) => updateNestedState('annualBonus', isNaN(vN) ? 0 : vN)}
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
                onChange={(_, vN) => updateNestedState('salaryGrowthRate', isNaN(vN) ? 0 : vN)}
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
                onChange={(e) => updateNestedState('probation.enabled', e.target.checked)}
              />
            </FormControl>
            {editableScenario.probation?.enabled && (
              <VStack spacing={3} align="stretch" pt={2}>
                <FormControl>
                  <FormLabel fontSize="sm">期間 (ヶ月)</FormLabel>
                  <NumberInput
                    size="sm"
                    value={editableScenario.probation?.durationMonths ?? 0}
                    onChange={(_, vN) =>
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
                    onChange={(_, vN) =>
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
                    onChange={(_, vN) =>
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
                  onChange={(e) => updateNestedState(`allowances.${index}.name`, e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <HStack>
                  <NumberInput
                    size="sm"
                    w="100%"
                    value={allowance.amount}
                    onChange={(_, vN) =>
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
                    onChange={(e) =>
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
                      onChange={(_, vN) =>
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
                    onClick={() => removeAllowance(index)}
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
                onChange={(e) =>
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
                    onChange={(_, vN) =>
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
                    onChange={(_, vN) =>
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
                onChange={(e) =>
                  updateNestedState('deductions.dependents.hasSpouse', e.target.checked)
                }
              />
            </HStack>
            <FormControl>
              <FormLabel fontSize="sm">扶養家族の人数</FormLabel>
              <NumberInput
                size="sm"
                value={editableScenario.deductions?.dependents?.numberOfDependents ?? 0}
                onChange={(_, vN) =>
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

  return (
    <HStack p={4} borderBottom="1px solid" borderColor="gray.200" bg="white" spacing={8}>
      <FormControl>
        <FormLabel fontSize="sm" mb={1}>
          計算期間: <Badge colorScheme="teal">{settings.predictionPeriod}年</Badge>
        </FormLabel>
        <Slider
          aria-label="prediction-period-slider"
          value={settings.predictionPeriod}
          onChange={(val) => setSettings({ ...settings, predictionPeriod: val })}
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
          月平均の残業時間: <Badge colorScheme="orange">{settings.averageOvertimeHours}時間</Badge>
        </FormLabel>
        <Slider
          aria-label="overtime-hours-slider"
          value={settings.averageOvertimeHours}
          onChange={(val) => setSettings({ ...settings, averageOvertimeHours: val })}
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
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
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

  const numScenarios = activeScenarios.length
  let cardStyleProps = {}
  if (numScenarios === 1) {
    cardStyleProps = { w: '100%', minW: '100%' }
  } else {
    cardStyleProps = { w: '50%', minW: '450px', flexShrink: 0 }
  }

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
          onClick={() => setIsGraphViewVisible(true)}
          size="sm"
          isDisabled={predictionResults.length === 0}
        >
          グラフ表示
        </Button>
      </HStack>

      <ControlSection />

      <Flex flex="1" w="100%" h="100%" overflowX="auto" p={4} gap={4}>
        {isCalculating && (
          <Flex w="100%" h="100%" align="center" justify="center">
            <Spinner size="xl" />
          </Flex>
        )}
        {!isCalculating &&
          activeScenarios.map((scenario) => {
            const result =
              predictionResults.find((r) => r.scenarioId === scenario.id)?.result || null
            return (
              <DataViewCard
                key={scenario.id}
                scenario={scenario}
                predictionResult={result}
                styleProps={cardStyleProps}
              />
            )
          })}
      </Flex>
    </Box>
  )
}
