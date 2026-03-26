import React from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Switch,
  VStack
} from '@chakra-ui/react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import type { Scenario } from '@myTypes/miraishi'

interface ScenarioInputFormProps {
  scenario: Scenario
  updateNestedState: (path: string, value: any) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  addAllowance: () => void
  removeAllowance: (index: number) => void
}

const CONTROL_SIZE = 'md' as const
const LABEL_FONT_SIZE = { base: 'sm', xl: 'md' } as const

const sectionCardProps = {
  bg: 'white',
  p: { base: 3, lg: 4 },
  borderRadius: 'lg',
  borderWidth: '1px',
  borderColor: 'gray.200',
  boxShadow: 'sm'
} as const

interface YenNumberInputProps {
  value: number
  onChange: (valueAsString: string, valueAsNumber: number) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  min?: number
}

const YenNumberInput = ({
  value,
  onChange,
  handleKeyDown,
  placeholder,
  min = 0
}: YenNumberInputProps): React.JSX.Element => (
  <NumberInput size={CONTROL_SIZE} w="100%" value={value} onChange={onChange} min={min}>
    <InputGroup size={CONTROL_SIZE}>
      <NumberInputField
        pr="3.2rem"
        placeholder={placeholder}
        bg="white"
        onKeyDown={handleKeyDown}
        inputMode="numeric"
      />
      <InputRightElement w="3.2rem" color="gray.500" fontSize="sm" pointerEvents="none">
        円
      </InputRightElement>
    </InputGroup>
  </NumberInput>
)

export const ScenarioInputForm = ({
  scenario,
  updateNestedState,
  handleKeyDown,
  addAllowance,
  removeAllowance
}: ScenarioInputFormProps): React.JSX.Element => {
  const hasSpouse = scenario.deductions?.dependents?.hasSpouse ?? false

  return (
    <Box h="100%" w="100%" overflowY="auto" p={{ base: 3, md: 4 }}>
      <VStack spacing={3} align="stretch">
        {/* 給与・賞与 */}
        <Box {...sectionCardProps}>
          <Heading size="md" mb={3}>
            給与・賞与
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, '2xl': 3 }} spacing={3}>
            <FormControl>
              <FormLabel fontSize={LABEL_FONT_SIZE}>基本給 (月額)</FormLabel>
              <YenNumberInput
                value={scenario.initialBasicSalary ?? 0}
                onChange={(_, valueAsNumber): void =>
                  updateNestedState('initialBasicSalary', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                }
                placeholder="例: 300000"
                handleKeyDown={handleKeyDown}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={LABEL_FONT_SIZE}>年間ボーナス (総額)</FormLabel>
              <YenNumberInput
                value={scenario.annualBonus ?? 0}
                onChange={(_, valueAsNumber): void =>
                  updateNestedState('annualBonus', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                }
                placeholder="例: 600000"
                handleKeyDown={handleKeyDown}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={LABEL_FONT_SIZE}>給与成長率 (年率 %)</FormLabel>
              <NumberInput
                size={CONTROL_SIZE}
                value={scenario.salaryGrowthRate ?? 0}
                onChange={(_, valueAsNumber): void =>
                  updateNestedState('salaryGrowthRate', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                }
                min={0}
                precision={1}
                step={0.1}
              >
                <NumberInputField
                  placeholder="例: 2.5"
                  bg="white"
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3} width="100%">
          <VStack spacing={3} align="stretch">
            {/* 試用期間 */}
            <VStack spacing={3} align="stretch" {...sectionCardProps}>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel
                  htmlFor={`probation-enabled-${scenario.id}`}
                  mb="0"
                  fontWeight="semibold"
                  fontSize={LABEL_FONT_SIZE}
                >
                  試用期間
                </FormLabel>
                <Switch
                  id={`probation-enabled-${scenario.id}`}
                  size="lg"
                  isChecked={scenario.probation?.enabled ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateNestedState('probation.enabled', e.target.checked)
                  }
                />
              </FormControl>

              {scenario.probation?.enabled && (
                <SimpleGrid columns={{ base: 1, lg: 2, '2xl': 3 }} spacing={3} pt={2}>
                  <FormControl>
                    <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                      期間 (ヶ月)
                    </FormLabel>
                    <NumberInput
                      size={CONTROL_SIZE}
                      value={scenario.probation?.durationMonths ?? 0}
                      onChange={(_, valueAsNumber): void =>
                        updateNestedState(
                          'probation.durationMonths',
                          isNaN(valueAsNumber) ? 0 : valueAsNumber
                        )
                      }
                      min={0}
                    >
                      <NumberInputField onKeyDown={handleKeyDown} bg="white" inputMode="numeric" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                      基本給 (月額)
                    </FormLabel>
                    <YenNumberInput
                      value={scenario.probation?.basicSalary ?? 0}
                      onChange={(_, valueAsNumber): void =>
                        updateNestedState('probation.basicSalary', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                      }
                      handleKeyDown={handleKeyDown}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                      固定残業代 (月額)
                    </FormLabel>
                    <YenNumberInput
                      value={scenario.probation?.fixedOvertime ?? 0}
                      onChange={(_, valueAsNumber): void =>
                        updateNestedState(
                          'probation.fixedOvertime',
                          isNaN(valueAsNumber) ? 0 : valueAsNumber
                        )
                      }
                      handleKeyDown={handleKeyDown}
                    />
                  </FormControl>
                </SimpleGrid>
              )}
            </VStack>

            {/* 固定残業代 */}
            <VStack spacing={3} align="stretch" {...sectionCardProps}>
              <Heading size="md">固定残業代</Heading>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel
                  htmlFor={`fixed-overtime-${scenario.id}`}
                  mb="0"
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight="medium"
                >
                  固定残業代制度
                </FormLabel>
                <Switch
                  id={`fixed-overtime-${scenario.id}`}
                  size="lg"
                  isChecked={scenario.overtime?.fixedOvertime?.enabled ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateNestedState('overtime.fixedOvertime.enabled', e.target.checked)
                  }
                />
              </FormControl>

              {scenario.overtime?.fixedOvertime?.enabled && (
                <HStack flexWrap="wrap" spacing={3} alignItems="flex-end">
                  <FormControl flex="1" minW={{ base: '100%', md: '220px' }}>
                    <FormLabel fontSize={LABEL_FONT_SIZE}>金額 (月額)</FormLabel>
                    <YenNumberInput
                      value={scenario.overtime?.fixedOvertime?.amount ?? 0}
                      onChange={(_, valueAsNumber): void =>
                        updateNestedState(
                          'overtime.fixedOvertime.amount',
                          isNaN(valueAsNumber) ? 0 : valueAsNumber
                        )
                      }
                      handleKeyDown={handleKeyDown}
                    />
                  </FormControl>

                  <FormControl flex="1" minW={{ base: '100%', md: '220px' }}>
                    <FormLabel fontSize={LABEL_FONT_SIZE}>みなし時間 (h)</FormLabel>
                    <NumberInput
                      size={CONTROL_SIZE}
                      value={scenario.overtime?.fixedOvertime?.hours ?? 0}
                      onChange={(_, valueAsNumber): void =>
                        updateNestedState(
                          'overtime.fixedOvertime.hours',
                          isNaN(valueAsNumber) ? 0 : valueAsNumber
                        )
                      }
                      min={0}
                    >
                      <NumberInputField onKeyDown={handleKeyDown} bg="white" inputMode="numeric" />
                    </NumberInput>
                  </FormControl>
                </HStack>
              )}
            </VStack>

            {/* 扶養・控除 */}
            <VStack spacing={3} align="stretch" {...sectionCardProps}>
              <Heading size="md">扶養・控除</Heading>
              <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={3}>
                <FormLabel mb="0" fontSize={LABEL_FONT_SIZE} fontWeight="medium">
                  配偶者の有無
                </FormLabel>
                <ButtonGroup isAttached size={CONTROL_SIZE} variant="outline">
                  <Button
                    colorScheme={hasSpouse ? 'blue' : 'gray'}
                    variant={hasSpouse ? 'solid' : 'outline'}
                    onClick={(): void => updateNestedState('deductions.dependents.hasSpouse', true)}
                  >
                    有
                  </Button>
                  <Button
                    colorScheme={hasSpouse ? 'gray' : 'blue'}
                    variant={hasSpouse ? 'outline' : 'solid'}
                    onClick={(): void => updateNestedState('deductions.dependents.hasSpouse', false)}
                  >
                    無
                  </Button>
                </ButtonGroup>
              </HStack>

              <FormControl>
                <FormLabel fontSize={LABEL_FONT_SIZE}>扶養家族の人数</FormLabel>
                <NumberInput
                  size={CONTROL_SIZE}
                  value={scenario.deductions?.dependents?.numberOfDependents ?? 0}
                  onChange={(_, valueAsNumber): void =>
                    updateNestedState(
                      'deductions.dependents.numberOfDependents',
                      isNaN(valueAsNumber) ? 0 : valueAsNumber
                    )
                  }
                  min={0}
                >
                  <NumberInputField onKeyDown={handleKeyDown} bg="white" inputMode="numeric" />
                </NumberInput>
              </FormControl>
            </VStack>
          </VStack>

          {/* 各種手当 */}
          <VStack spacing={3} align="stretch" {...sectionCardProps}>
            <HStack justifyContent="space-between" mb={1}>
              <Heading size="md">各種手当</Heading>
              <Button leftIcon={<FaPlus />} size={CONTROL_SIZE} onClick={addAllowance}>
                追加
              </Button>
            </HStack>

            <Box maxHeight="300px" overflowY="auto" width="100%" css={{ 'scrollbar-gutter': 'stable' }}>
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
                      <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                        手当名
                      </FormLabel>
                      <Input
                        size={CONTROL_SIZE}
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
                      <FormControl flex="1" minW={{ base: '100%', md: '180px' }}>
                        <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                          金額
                        </FormLabel>
                        <YenNumberInput
                          value={allowance.amount}
                          onChange={(_, valueAsNumber): void =>
                            updateNestedState(
                              `allowances.${index}.amount`,
                              isNaN(valueAsNumber) ? 0 : valueAsNumber
                            )
                          }
                          handleKeyDown={handleKeyDown}
                        />
                      </FormControl>

                      <FormControl w="auto" flexShrink={0}>
                        <FormLabel fontSize={LABEL_FONT_SIZE} mb={1}>
                          期間
                        </FormLabel>
                        <HStack spacing={1}>
                          {allowance.duration.type !== 'unlimited' && (
                            <NumberInput
                              size={CONTROL_SIZE}
                              w="104px"
                              value={allowance.duration.value}
                              onChange={(_, valueAsNumber): void =>
                                updateNestedState(
                                  `allowances.${index}.duration.value`,
                                  isNaN(valueAsNumber) ? 0 : valueAsNumber
                                )
                              }
                              min={0}
                            >
                              <NumberInputField
                                onKeyDown={handleKeyDown}
                                bg="white"
                                inputMode="numeric"
                              />
                            </NumberInput>
                          )}

                          <Select
                            size={CONTROL_SIZE}
                            w="120px"
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
                        size={CONTROL_SIZE}
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
}
