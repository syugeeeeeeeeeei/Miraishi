import React from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Switch,
  VStack
} from '@chakra-ui/react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import type { Scenario } from '@myTypes/miraishi'

interface InputViewProps {
  scenario: Scenario
  updateNestedState: (path: string, value: any) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  addAllowance: () => void
  removeAllowance: (index: number) => void
}

export const InputView = ({
  scenario,
  updateNestedState,
  handleKeyDown,
  addAllowance,
  removeAllowance
}: InputViewProps): React.JSX.Element => (
  <Box h="100%" w="100%" overflowY="auto" p={{ base: 3, md: 6 }}>
    <VStack spacing={4} align="stretch">
      {/* 給与・賞与 */}
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
              onChange={(_, vN): void =>
                updateNestedState('initialBasicSalary', isNaN(vN) ? 0 : vN)
              }
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
          {/* 試用期間 */}
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

          {/* 固定残業代 */}
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

          {/* 扶養・控除 */}
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
                  updateNestedState('deductions.dependents.numberOfDependents', isNaN(vN) ? 0 : vN)
                }
                min={0}
              >
                <NumberInputField onKeyDown={handleKeyDown} bg="white" />
              </NumberInput>
            </FormControl>
          </VStack>
        </VStack>

        {/* 各種手当 */}
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
