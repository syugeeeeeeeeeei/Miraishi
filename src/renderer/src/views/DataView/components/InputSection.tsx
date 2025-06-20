import {
  Box,
  Button,
  createListCollection,
  Field,
  HStack,
  IconButton,
  Input,
  NumberInput,
  Select,
  Stack,
  Text
} from '@chakra-ui/react'
// react-iconsをインポート
import { IoAdd, IoTrash } from 'react-icons/io5'
import { useAtom } from 'jotai'
import { activeScenarioAtom } from '../../../atoms/scenarioAtoms'
import { Allowance, Overtime, Scenario } from '@types/scenario'
import React from 'react'

export const InputSection = (): React.JSX.Element => {
  const [activeScenario, setActiveScenario] = useAtom(activeScenarioAtom)

  // 汎用的な更新ハンドラ
  const updateScenario = <K extends keyof Scenario>(key: K, value: Scenario[K]): void => {
    setActiveScenario((prev) => ({ ...prev, [key]: value }))
  }

  // 数値入力用のハンドラ
  const handleNumberChange = (
    key: 'baseSalary' | 'salaryGrowthRate',
    details: { valueAsString: string; valueAsNumber: number }
  ): void => {
    updateScenario(key, details.valueAsNumber)
  }

  // 残業時間のハンドラ
  const handleOvertimeHoursChange = (details: {
    valueAsString: string
    valueAsNumber: number
  }): void => {
    setActiveScenario((prev) => ({
      ...prev,
      overtime: { ...prev.overtime, hours: details.valueAsNumber }
    }))
  }

  // 手当の変更ハンドラ
  const handleAllowanceChange = (
    index: number,
    field: keyof Allowance,
    value: string | number
  ): void => {
    const newAllowances = [...activeScenario.allowances]
    newAllowances[index] = { ...newAllowances[index], [field]: value }
    updateScenario('allowances', newAllowances)
  }

  const addAllowance = (): void => {
    const newAllowances = [
      ...activeScenario.allowances,
      { name: '新規手当', amount: 0 } as Allowance
    ]
    updateScenario('allowances', newAllowances)
  }

  const removeAllowance = (index: number): void => {
    const newAllowances = activeScenario.allowances.filter((_, i) => i !== index)
    updateScenario('allowances', newAllowances)
  }
  const frameworks = createListCollection({
    items: [
      { label: 'React.js', value: 'react' },
      { label: 'Vue.js', value: 'vue' },
      { label: 'Angular', value: 'angular' },
      { label: 'Svelte', value: 'svelte' }
    ]
  })

  return (
    <Box>
      <Stack gap={6}>
        {/* シナリオ名 */}
        <Field.Root>
          <Field.Label>シナリオ名</Field.Label>
          <Input
            value={activeScenario.name}
            onChange={(e) => updateScenario('name', e.target.value)}
          />
        </Field.Root>

        {/* 基本給 */}
        <Field.Root>
          <Field.Label>月収（基本給）</Field.Label>
          <NumberInput.Root
            value={String(activeScenario.baseSalary)}
            onValueChange={(details) => handleNumberChange('baseSalary', details)}
            step={10000}
            min={0}
          >
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        {/* 手当 */}
        <Field.Root>
          <Field.Label>手当</Field.Label>
          <Stack gap={3}>
            {activeScenario.allowances.map((allowance, index) => (
              <HStack key={index}>
                <Input
                  placeholder="手当名 (例: 住宅手当)"
                  value={allowance.name}
                  onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                />
                <NumberInput.Root
                  value={String(allowance.amount)}
                  onValueChange={(details) =>
                    handleAllowanceChange(index, 'amount', details.valueAsNumber)
                  }
                  min={0}
                >
                  <NumberInput.Input />
                </NumberInput.Root>
                <IconButton
                  aria-label="手当を削除"
                  onClick={() => removeAllowance(index)}
                  colorScheme="red"
                >
                  <IoTrash />
                </IconButton>
              </HStack>
            ))}
            <Button onClick={addAllowance} size="sm">
              <IoAdd />
              手当を追加
            </Button>
          </Stack>
        </Field.Root>

        {/* 残業代 */}
        <Field.Root>
          <Field.Label>残業代</Field.Label>
          <HStack>
            {/* ▼▼▼ ここからSelectコンポーネントを修正 ▼▼▼ */}
            <Select.Root
              value={activeScenario.overtime.type}
              onValueChange={handleOvertimeTypeChange}
              flex="1"
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  <Select.Item item="fixed">
                    固定残業代なし
                    <Select.ItemIndicator />
                  </Select.Item>
                  <Select.Item item="variable">
                    固定残業代あり
                    <Select.ItemIndicator />
                  </Select.Item>
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <NumberInput.Root
              value={String(activeScenario.overtime.hours)}
              onValueChange={handleOvertimeHoursChange}
              min={0}
            >
              <NumberInput.Input />
            </NumberInput.Root>
            <Text whiteSpace="nowrap">時間/月</Text>
          </HStack>
        </Field.Root>

        {/* 昇給率 */}
        <Field.Root>
          <Field.Label>年間昇給率 (%)</Field.Label>
          <NumberInput.Root
            value={String(activeScenario.salaryGrowthRate)}
            onValueChange={(details) => handleNumberChange('salaryGrowthRate', details)}
            step={0.1}
            formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
          >
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
      </Stack>
    </Box>
  )
}
