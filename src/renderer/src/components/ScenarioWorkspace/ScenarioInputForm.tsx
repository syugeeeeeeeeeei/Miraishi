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
  Text,
  VStack
} from '@chakra-ui/react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import type { Scenario } from '@myTypes/miraishi'
import { INDUSTRY_OPTIONS, PREFECTURE_OPTIONS } from '../../../../shared/taxSchemaDefaults'

interface ScenarioInputFormProps {
  scenario: Scenario
  updateNestedState: (path: string, value: any) => void
  onBonusModeSwitch: (mode: 'fixed' | 'basicSalaryMonths') => void
  onBonusInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void
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
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  min?: number
}

const YenNumberInput = ({
  value,
  onChange,
  handleKeyDown,
  onBlur,
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
        onBlur={onBlur}
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
  onBonusModeSwitch,
  onBonusInputBlur,
  handleKeyDown,
  addAllowance,
  removeAllowance
}: ScenarioInputFormProps): React.JSX.Element => {
  const hasSpouse = scenario.deductions?.dependents?.hasSpouse ?? false
  const bonusMode = scenario.bonus?.mode ?? 'fixed'
  const bonusMonths = scenario.bonus?.months ?? 2
  const isBonusLinkedToBasic = bonusMode === 'basicSalaryMonths'

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
              <FormLabel fontSize={LABEL_FONT_SIZE}>想定初任給 (月額)</FormLabel>
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
              <FormLabel fontSize={LABEL_FONT_SIZE}>ボーナス</FormLabel>
              <VStack align="stretch" spacing={2}>
                <ButtonGroup isAttached size={CONTROL_SIZE} variant="outline">
                  <Button
                    colorScheme={isBonusLinkedToBasic ? 'gray' : 'blue'}
                    variant={isBonusLinkedToBasic ? 'outline' : 'solid'}
                    data-role="bonus-mode-switch"
                    onClick={(): void => onBonusModeSwitch('fixed')}
                  >
                    固定額
                  </Button>
                  <Button
                    colorScheme={isBonusLinkedToBasic ? 'blue' : 'gray'}
                    variant={isBonusLinkedToBasic ? 'solid' : 'outline'}
                    data-role="bonus-mode-switch"
                    onClick={(): void => onBonusModeSwitch('basicSalaryMonths')}
                  >
                    基本給連動
                  </Button>
                </ButtonGroup>

                {isBonusLinkedToBasic ? (
                  <NumberInput
                    size={CONTROL_SIZE}
                    value={bonusMonths}
                    onChange={(_, valueAsNumber): void =>
                      updateNestedState('bonus', {
                        mode: 'basicSalaryMonths',
                        months: isNaN(valueAsNumber) ? 0 : valueAsNumber
                      })
                    }
                    min={0}
                    precision={1}
                    step={0.5}
                  >
                    <InputGroup size={CONTROL_SIZE}>
                      <NumberInputField
                        pr="4.4rem"
                        placeholder="例: 2.0"
                        bg="white"
                        onKeyDown={handleKeyDown}
                        onBlur={onBonusInputBlur}
                        inputMode="decimal"
                      />
                      <InputRightElement w="4.4rem" color="gray.500" fontSize="sm" pointerEvents="none">
                        ヶ月分
                      </InputRightElement>
                    </InputGroup>
                  </NumberInput>
                ) : (
                  <YenNumberInput
                    value={scenario.annualBonus ?? 0}
                    onChange={(_, valueAsNumber): void =>
                      updateNestedState('annualBonus', isNaN(valueAsNumber) ? 0 : valueAsNumber)
                    }
                    placeholder="例: 600000"
                    handleKeyDown={handleKeyDown}
                    onBlur={onBonusInputBlur}
                  />
                )}
              </VStack>
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
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3} pt={2}>
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
                </SimpleGrid>
              )}
              {scenario.probation?.enabled && (
                <Text fontSize="sm" color="gray.600">
                  試用期間中の固定残業代も「基本給 + 固定手当」に連動して自動計算されます。
                </Text>
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
                <VStack align="stretch" spacing={2}>
                  <FormControl maxW={{ base: '100%', md: '260px' }}>
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
                  <Text fontSize="sm" color="gray.600">
                    固定残業代（月額）は毎年自動計算されます: （残業計算用月給 ÷ 160）× 1.25 × みなし時間
                  </Text>
                </VStack>
              )}
            </VStack>

            {/* 扶養・控除 */}
            <VStack spacing={3} align="stretch" {...sectionCardProps}>
              <Heading size="md">扶養・控除</Heading>
              <FormControl>
                <FormLabel fontSize={LABEL_FONT_SIZE}>前年度収入 (住民税計算用)</FormLabel>
                <YenNumberInput
                  value={scenario.deductions?.previousYearIncome ?? 0}
                  onChange={(_, valueAsNumber): void =>
                    updateNestedState(
                      'deductions.previousYearIncome',
                      isNaN(valueAsNumber) ? 0 : valueAsNumber
                    )
                  }
                  handleKeyDown={handleKeyDown}
                />
                <Text mt={1} fontSize="xs" color="gray.600">
                  新卒入社など前年度収入がない場合は 0 円のままで問題ありません。
                </Text>
              </FormControl>
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

              <FormControl>
                <FormLabel fontSize={LABEL_FONT_SIZE}>勤務都道府県</FormLabel>
                <Select
                  size={CONTROL_SIZE}
                  value={scenario.taxProfile?.prefectureCode ?? ''}
                  onChange={(e): void =>
                    updateNestedState('taxProfile.prefectureCode', e.target.value)
                  }
                  bg="white"
                >
                  {PREFECTURE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize={LABEL_FONT_SIZE}>業種（雇用保険率）</FormLabel>
                <Select
                  size={CONTROL_SIZE}
                  value={scenario.taxProfile?.industryCode ?? ''}
                  onChange={(e): void =>
                    updateNestedState('taxProfile.industryCode', e.target.value)
                  }
                  bg="white"
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </Select>
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
