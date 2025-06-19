import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { useAtom } from 'jotai'
import { activeScenarioAtom } from '../../atoms/scenarioAtoms'
import { Allowance, OvertimeType } from '../../../../types/scenario'

export const InputSection = (): JSX.Element => {
  const [activeScenario, setActiveScenario] = useAtom(activeScenarioAtom)

  // シナリオ名
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setActiveScenario({ ...activeScenario, scenarioName: e.target.value })
  }

  // 基本給
  const handleBaseSalaryChange = (_: string, valueAsNumber: number): void => {
    setActiveScenario({ ...activeScenario, baseSalary: valueAsNumber })
  }

  // 手当
  const handleAllowanceChange = (index: number, field: keyof Allowance, value: string | number): void => {
    const newAllowances = [...activeScenario.allowances]
    newAllowances[index] = { ...newAllowances[index], [field]: value }
    setActiveScenario({ ...activeScenario, allowances: newAllowances })
  }

  const addAllowance = (): void => {
    setActiveScenario({
      ...activeScenario,
      allowances: [...activeScenario.allowances, { name: '新規手当', amount: 0 }],
    })
  }

  const removeAllowance = (index: number): void => {
    const newAllowances = activeScenario.allowances.filter((_, i) => i !== index)
    setActiveScenario({ ...activeScenario, allowances: newAllowances })
  }

  // 残業代
  const handleOvertimeTypeChange = (e: React.ChangeEvent<Select>): void => {
    setActiveScenario({
      ...activeScenario,
      overtime: { ...activeScenario.overtime, type: e.target.value as OvertimeType },
    })
  }
  const handleOvertimeHoursChange = (_: string, valueAsNumber: number): void => {
    setActiveScenario({
      ...activeScenario,
      overtime: { ...activeScenario.overtime, hours: valueAsNumber },
    })
  }

  // 成長率
  const handleGrowthRateChange = (_: string, valueAsNumber: number): void => {
    setActiveScenario({ ...activeScenario, salaryGrowthRate: valueAsNumber })
  }

  return (
    <Box>
      <Stack spacing={6}>
        {/* シナリオ名 */}
        <FormControl>
          <FormLabel>シナリオ名</FormLabel>
          <Input value={activeScenario.scenarioName} onChange={handleNameChange} />
        </FormControl>

        {/* 基本給 */}
        <FormControl>
          <FormLabel>月収（基本給）</FormLabel>
          <NumberInput
            value={activeScenario.baseSalary}
            onChange={handleBaseSalaryChange}
            step={10000}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/* 手当 */}
        <FormControl>
          <FormLabel>手当</FormLabel>
          <Stack spacing={3}>
            {activeScenario.allowances.map((allowance, index) => (
              <HStack key={index}>
                <Input
                  placeholder="手当名 (例: 住宅手当)"
                  value={allowance.name}
                  onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                />
                <NumberInput
                  value={allowance.amount}
                  onChange={(_, num) => handleAllowanceChange(index, 'amount', num)}
                  min={0}
                >
                  <NumberInputField />
                </NumberInput>
                <IconButton
                  aria-label="手当を削除"
                  icon={<DeleteIcon />}
                  onClick={() => removeAllowance(index)}
                  colorScheme="red"
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addAllowance} size="sm">
              手当を追加
            </Button>
          </Stack>
        </FormControl>

        {/* 残業代 */}
        <FormControl>
          <FormLabel>残業代</FormLabel>
          <HStack>
            <Select value={activeScenario.overtime.type} onChange={handleOvertimeTypeChange}>
              <option value="fixed">固定残業代なし</option>
              <option value="variable">固定残業代あり</option>
            </Select>
            <NumberInput
              value={activeScenario.overtime.hours}
              onChange={handleOvertimeHoursChange}
              min={0}
            >
              <NumberInputField />
            </NumberInput>
            <Text whiteSpace="nowrap">時間/月</Text>
          </HStack>
        </FormControl>

        {/* 昇給率 */}
        <FormControl>
          <FormLabel>年間昇給率</FormLabel>
          <NumberInput
            value={activeScenario.salaryGrowthRate}
            onChange={handleGrowthRateChange}
            step={0.1}
            precision={2}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </Stack>
    </Box>
  )
}
