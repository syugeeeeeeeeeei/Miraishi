/**
 * @file src/renderer/src/components/DataView.tsx
 * @description 選択されたシナリオの詳細を表示・編集するコンポーネント
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
  InputGroup,
  InputRightAddon,
  Switch,
  Spinner,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'
import { FaPlus, FaTrash, FaAngleDoubleLeft } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import {
  scenariosAtom,
  activeScenarioIdAtom,
  updateScenarioAtom,
  isGraphViewVisibleAtom,
  predictionResultAtom
} from '@renderer/store/atoms'
import type { Scenario, Allowance, FixedOvertime } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { CalculationResult } from './CalculationResult'

export function DataView(): React.JSX.Element {
  const [scenarios] = useAtom(scenariosAtom)
  const [activeId] = useAtom(activeScenarioIdAtom)
  const updateScenario = useSetAtom(updateScenarioAtom)
  const [isGraphVisible, setIsGraphVisible] = useAtom(isGraphViewVisibleAtom)
  const [calculationResult, setCalculationResult] = useAtom(predictionResultAtom)

  const [editableScenario, setEditableScenario] = useState<Scenario | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const scenario = scenarios.find((s) => s.id === activeId) || null
    setEditableScenario(scenario ? { ...scenario } : null)
    setCalculationResult(null)
  }, [activeId, scenarios, setCalculationResult])

  const handleNumberChange = (name: keyof Scenario, valueAsString: string, valueAsNumber: number): void => {
    if (!editableScenario) return
    setEditableScenario({
      ...editableScenario,
      [name]: isNaN(valueAsNumber) ? 0 : valueAsNumber
    })
  }

  const handleAllowanceChange = <K extends keyof Allowance>(
    index: number,
    field: K,
    value: Allowance[K]
  ): void => {
    if (!editableScenario) return
    const newAllowances = editableScenario.allowances.map((allowance, i) => {
      if (i === index) {
        return { ...allowance, [field]: value }
      }
      return allowance
    })
    setEditableScenario({ ...editableScenario, allowances: newAllowances })
  }

  const handleOvertimeChange = <K extends keyof FixedOvertime>(
    field: K,
    value: FixedOvertime[K]
  ): void => {
    if (!editableScenario) return
    const newOvertime = {
      ...editableScenario.overtime,
      fixedOvertime: {
        ...editableScenario.overtime.fixedOvertime,
        [field]: value
      }
    }
    setEditableScenario({ ...editableScenario, overtime: newOvertime })
  }

  const addAllowance = (): void => {
    if (!editableScenario) return
    const newAllowance: Allowance = {
      id: uuidv4(),
      name: '新規手当',
      type: 'fixed',
      amount: 10000,
      duration: { type: 'unlimited' }
    }
    setEditableScenario({
      ...editableScenario,
      allowances: [...editableScenario.allowances, newAllowance]
    })
  }

  const removeAllowance = (index: number): void => {
    if (!editableScenario) return
    const newAllowances = editableScenario.allowances.filter((_, i) => i !== index)
    setEditableScenario({ ...editableScenario, allowances: newAllowances })
  }

  const handleSave = (): void => {
    if (editableScenario) {
      updateScenario(editableScenario)
    }
  }

  const handleCalculate = async (): Promise<void> => {
    if (!editableScenario) return
    setIsCalculating(true)
    setCalculationResult(null)
    const result = await window.api.calculatePrediction(editableScenario)
    if ('details' in result) {
      setCalculationResult(result)
    } else {
      console.error('Calculation failed:', result.error)
    }
    setIsCalculating(false)
  }

  if (!editableScenario) {
    return (
      <Box flex="1" p={8} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Heading size="lg" color="brand.darkGray">シナリオを選択してください</Heading>
          <Text mt={2}>左のパネルからシナリオを選択するか、新規作成してください。</Text>
        </VStack>
      </Box>
    )
  }

  return (
    // 🔽 ----- ここから修正 ----- 🔽
    <Box flex="1" h="100vh" display="flex" flexDirection="column">
      {calculationResult && !isGraphVisible && (
        <IconButton
          aria-label="Open graph"
          icon={<FaAngleDoubleLeft />}
          position="fixed"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          onClick={(): void => setIsGraphVisible(true)}
          colorScheme="teal"
          borderRightRadius={0}
          zIndex={15}
        />
      )}

      {/* --- 固定ヘッダー --- */}
      <Box
        p={8}
        pb={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="brand.base"
      >
        <HStack justifyContent="space-between">
          <Heading size="lg" noOfLines={1}>
            シナリオ: {editableScenario.title}
          </Heading>
          <HStack>
            <Button
              colorScheme="teal"
              bg="brand.accent"
              color="white"
              onClick={handleSave}
              flexShrink={0}
            >
              変更を保存
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCalculate}
              isLoading={isCalculating}
              flexShrink={0}
            >
              計算実行
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* --- スクロール可能ボディ --- */}
      <Box flex="1" overflowY="auto" p={8} pt={6}>
        <VStack spacing={6} align="stretch" pb={8}>
          <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={2}>基本情報</Heading>
            <FormControl>
              <FormLabel>シナリオ名</FormLabel>
              <Input
                name="title"
                value={editableScenario.title}
                onChange={(e): void => setEditableScenario({ ...editableScenario, title: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>初月の基本給（月額）</FormLabel>
              <NumberInput
                value={editableScenario.initialBasicSalary}
                onChange={(valueAsString, valueAsNumber): void =>
                  handleNumberChange('initialBasicSalary', valueAsString, valueAsNumber)
                }
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>

          <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
            <HStack justifyContent="space-between">
              <Heading size="md">手当</Heading>
              <Button leftIcon={<FaPlus />} size="sm" onClick={addAllowance}>
                手当を追加
              </Button>
            </HStack>
            {editableScenario.allowances.map((allowance, index) => (
              <HStack key={allowance.id} spacing={3} align="flex-end">
                <FormControl>
                  <FormLabel fontSize="sm">手当名</FormLabel>
                  <Input
                    value={allowance.name}
                    onChange={(e): void => handleAllowanceChange(index, 'name', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">タイプ</FormLabel>
                  <Select
                    value={allowance.type}
                    onChange={(e): void =>
                      handleAllowanceChange(index, 'type', e.target.value as 'fixed' | 'percentage')
                    }
                  >
                    <option value="fixed">固定額</option>
                    <option value="percentage">割合</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">金額/割合</FormLabel>
                  <InputGroup>
                    <NumberInput
                      value={allowance.amount}
                      onChange={(_valueAsString, valueAsNumber): void =>
                        handleAllowanceChange(index, 'amount', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                      }
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                    <InputRightAddon>{allowance.type === 'fixed' ? '円' : '%'}</InputRightAddon>
                  </InputGroup>
                </FormControl>
                <IconButton
                  aria-label="Delete allowance"
                  icon={<FaTrash />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={(): void => removeAllowance(index)}
                />
              </HStack>
            ))}
            {editableScenario.allowances.length === 0 && (
              <Text fontSize="sm" color="gray.500">
                手当はありません。
              </Text>
            )}
          </VStack>

          <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={2}>残業代</Heading>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="fixed-overtime-switch" mb="0">
                固定残業代制度
              </FormLabel>
              <Switch
                id="fixed-overtime-switch"
                isChecked={editableScenario.overtime.fixedOvertime.enabled}
                onChange={(e): void => handleOvertimeChange('enabled', e.target.checked)}
              />
            </FormControl>
            {editableScenario.overtime.fixedOvertime.enabled && (
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>固定残業代（月額）</FormLabel>
                  <NumberInput
                    value={editableScenario.overtime.fixedOvertime.amount}
                    onChange={(_valueAsString, valueAsNumber): void =>
                      handleOvertimeChange('amount', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                    }
                    min={0}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>みなし残業時間</FormLabel>
                  <NumberInput
                    value={editableScenario.overtime.fixedOvertime.hours}
                    onChange={(_valueAsString, valueAsNumber): void =>
                      handleOvertimeChange('hours', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                    }
                    min={0}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>
            )}
          </VStack>

          <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={2}>その他設定</Heading>
            <FormControl>
              <FormLabel>年間給与成長率 (%)</FormLabel>
              <NumberInput
                value={editableScenario.salaryGrowthRate}
                onChange={(valueAsString, valueAsNumber): void =>
                  handleNumberChange('salaryGrowthRate', valueAsString, valueAsNumber)
                }
                min={0}
                precision={1}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>

          {isCalculating && <Spinner size="xl" alignSelf="center" my={10} />}
          {calculationResult && <CalculationResult result={calculationResult} />}
        </VStack>
      </Box>
    </Box>
    // 🔼 ----- ここまで修正 ----- 🔼
  )
}
