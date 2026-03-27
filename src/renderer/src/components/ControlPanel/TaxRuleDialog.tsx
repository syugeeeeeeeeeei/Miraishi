import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Spinner,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import type { TaxSchema } from '@myTypes/miraishi'

interface TaxRuleDialogProps {
  isOpen: boolean
  isLoading: boolean
  initialTaxSchema: TaxSchema | null
  onCloseWithoutChanges: () => void
  onConfirm: (nextTaxSchema: TaxSchema) => Promise<void>
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isTaxSchemaObject = (value: unknown): value is TaxSchema => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const schema = value as TaxSchema

  if (typeof schema.version !== 'string') {
    return false
  }

  if (!Array.isArray(schema.incomeTaxRates) || schema.incomeTaxRates.length === 0) {
    return false
  }
  const areIncomeTaxRatesValid = schema.incomeTaxRates.every((rate) => {
    const isThresholdValid = rate.threshold === null || isFiniteNumber(rate.threshold)
    return isThresholdValid && isFiniteNumber(rate.rate) && isFiniteNumber(rate.deduction)
  })
  if (!areIncomeTaxRatesValid) {
    return false
  }

  if (!isFiniteNumber(schema.residentTaxRate)) {
    return false
  }

  if (
    !schema.socialInsurance ||
    !isFiniteNumber(schema.socialInsurance.healthInsurance.rate) ||
    !isFiniteNumber(schema.socialInsurance.healthInsurance.maxStandardRemuneration) ||
    !isFiniteNumber(schema.socialInsurance.pension.rate) ||
    !isFiniteNumber(schema.socialInsurance.pension.maxStandardRemuneration) ||
    !isFiniteNumber(schema.socialInsurance.employmentInsurance.rate)
  ) {
    return false
  }

  if (
    !schema.deductions ||
    !isFiniteNumber(schema.deductions.basic) ||
    !isFiniteNumber(schema.deductions.spouse) ||
    !isFiniteNumber(schema.deductions.dependent)
  ) {
    return false
  }

  return true
}

const toDraftCopy = (schema: TaxSchema): TaxSchema => JSON.parse(JSON.stringify(schema))

const parseTaxSchemaFromText = (
  jsonText: string
): { schema: TaxSchema | null; error: string | null } => {
  try {
    const parsed = JSON.parse(jsonText)
    if (!isTaxSchemaObject(parsed)) {
      return {
        schema: null,
        error: '税金ルールJSONの形式が不正です。必須フィールドと数値型を確認してください。'
      }
    }
    return { schema: parsed, error: null }
  } catch {
    return { schema: null, error: 'JSONの構文エラーがあります。' }
  }
}

export function TaxRuleDialog({
  isOpen,
  isLoading,
  initialTaxSchema,
  onCloseWithoutChanges,
  onConfirm
}: TaxRuleDialogProps): React.JSX.Element {
  const [draftTaxSchema, setDraftTaxSchema] = useState<TaxSchema | null>(null)
  const [editorText, setEditorText] = useState<string>('')
  const [editorError, setEditorError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect((): void => {
    if (!isOpen || !initialTaxSchema) {
      return
    }
    const nextDraft = toDraftCopy(initialTaxSchema)
    setDraftTaxSchema(nextDraft)
    setEditorText(JSON.stringify(nextDraft, null, 2))
    setEditorError(null)
  }, [isOpen, initialTaxSchema])

  const updateDraft = (updater: (prev: TaxSchema) => TaxSchema): void => {
    setDraftTaxSchema((prev) => {
      if (!prev) {
        return prev
      }
      const next = updater(prev)
      setEditorText(JSON.stringify(next, null, 2))
      setEditorError(null)
      return next
    })
  }

  const handleEditorChange = (value: string): void => {
    setEditorText(value)
    const parsedResult = parseTaxSchemaFromText(value)
    if (parsedResult.error || !parsedResult.schema) {
      setEditorError(parsedResult.error)
      return
    }
    setDraftTaxSchema(parsedResult.schema)
    setEditorError(null)
  }

  const handleConfirm = async (): Promise<void> => {
    if (!draftTaxSchema || editorError) {
      return
    }
    setIsSubmitting(true)
    try {
      await onConfirm(draftTaxSchema)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isConfirmDisabled = !draftTaxSchema || Boolean(editorError) || isLoading || isSubmitting

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseWithoutChanges}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="6xl"
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg="brand.base">
        <ModalHeader>税金ルール設定</ModalHeader>
        <ModalCloseButton />

        <ModalBody overflowY="auto" maxH="72vh" pt={0} px={6} pb={6}>
          {isLoading && !draftTaxSchema ? (
            <HStack justifyContent="center" py={12}>
              <Spinner />
              <Text>税金ルールを読み込み中...</Text>
            </HStack>
          ) : (
            <Tabs isFitted variant="unstyled">
              <TabList
                position="sticky"
                top={0}
                zIndex={2}
                mb={4}
                p={1}
                bg="gray.100"
                borderWidth="1px"
                borderColor="gray.300"
                borderRadius="lg"
                boxShadow="sm"
              >
                <Tab
                  fontWeight="semibold"
                  color="gray.700"
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                  _selected={{ bg: 'teal.500', color: 'white' }}
                >
                  フォームモード
                </Tab>
                <Tab
                  fontWeight="semibold"
                  color="gray.700"
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                  _selected={{ bg: 'teal.500', color: 'white' }}
                >
                  JSONエディットモード
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} pt={0}>
                  {draftTaxSchema && (
                    <VStack align="stretch" spacing={4}>
                      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                        <FormControl>
                          <FormLabel>バージョン</FormLabel>
                          <Input
                            value={draftTaxSchema.version}
                            onChange={(e): void =>
                              updateDraft((prev) => ({
                                ...prev,
                                version: e.target.value
                              }))
                            }
                          />
                        </FormControl>
                      </Box>

                      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                        <Text fontWeight="bold" mb={3}>
                          所得税の税率テーブル
                        </Text>
                        <VStack align="stretch" spacing={3}>
                          {draftTaxSchema.incomeTaxRates.map((rateRow, index) => (
                            <VStack
                              key={`income-tax-row-${index}`}
                              align="stretch"
                              spacing={2}
                              borderWidth="1px"
                              borderColor="gray.100"
                              borderRadius="md"
                              p={3}
                              bg="gray.50"
                            >
                              <HStack justifyContent="space-between">
                                <Text fontWeight="medium">{index + 1}段目</Text>
                                <IconButton
                                  aria-label="税率段を削除"
                                  icon={<FaTrash />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  isDisabled={draftTaxSchema.incomeTaxRates.length <= 1}
                                  onClick={(): void =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      incomeTaxRates: prev.incomeTaxRates.filter((_, i) => i !== index)
                                    }))
                                  }
                                />
                              </HStack>

                              <HStack alignItems="center" justifyContent="space-between">
                                <FormLabel mb={0}>上限なし</FormLabel>
                                <Switch
                                  isChecked={rateRow.threshold === null}
                                  onChange={(e): void =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      incomeTaxRates: prev.incomeTaxRates.map((row, i) =>
                                        i === index
                                          ? { ...row, threshold: e.target.checked ? null : 0 }
                                          : row
                                      )
                                    }))
                                  }
                                />
                              </HStack>

                              <FormControl isDisabled={rateRow.threshold === null}>
                                <FormLabel>課税所得の上限</FormLabel>
                                <NumberInput
                                  min={0}
                                  value={rateRow.threshold ?? 0}
                                  onChange={(_, valueAsNumber): void =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      incomeTaxRates: prev.incomeTaxRates.map((row, i) =>
                                        i === index
                                          ? {
                                              ...row,
                                              threshold: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                            }
                                          : row
                                      )
                                    }))
                                  }
                                >
                                  <NumberInputField inputMode="numeric" />
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>税率</FormLabel>
                                <NumberInput
                                  min={0}
                                  step={0.001}
                                  precision={4}
                                  value={rateRow.rate}
                                  onChange={(_, valueAsNumber): void =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      incomeTaxRates: prev.incomeTaxRates.map((row, i) =>
                                        i === index
                                          ? { ...row, rate: isNaN(valueAsNumber) ? 0 : valueAsNumber }
                                          : row
                                      )
                                    }))
                                  }
                                >
                                  <NumberInputField inputMode="decimal" />
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>控除額</FormLabel>
                                <NumberInput
                                  min={0}
                                  value={rateRow.deduction}
                                  onChange={(_, valueAsNumber): void =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      incomeTaxRates: prev.incomeTaxRates.map((row, i) =>
                                        i === index
                                          ? {
                                              ...row,
                                              deduction: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                            }
                                          : row
                                      )
                                    }))
                                  }
                                >
                                  <NumberInputField inputMode="numeric" />
                                </NumberInput>
                              </FormControl>
                            </VStack>
                          ))}
                        </VStack>

                        <Button
                          mt={3}
                          leftIcon={<FaPlus />}
                          onClick={(): void =>
                            updateDraft((prev) => ({
                              ...prev,
                              incomeTaxRates: [
                                ...prev.incomeTaxRates,
                                { threshold: null, rate: 0, deduction: 0 }
                              ]
                            }))
                          }
                        >
                          税率段を追加
                        </Button>
                      </Box>

                      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                        <Text fontWeight="bold" mb={3}>
                          住民税・社会保険
                        </Text>
                        <VStack align="stretch" spacing={3}>
                          <FormControl>
                            <FormLabel>住民税率</FormLabel>
                            <NumberInput
                              min={0}
                              step={0.001}
                              precision={4}
                              value={draftTaxSchema.residentTaxRate}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  residentTaxRate: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                }))
                              }
                            >
                              <NumberInputField inputMode="decimal" />
                            </NumberInput>
                          </FormControl>

                          <Divider />

                          <FormControl>
                            <FormLabel>健康保険料率</FormLabel>
                            <NumberInput
                              min={0}
                              step={0.001}
                              precision={4}
                              value={draftTaxSchema.socialInsurance.healthInsurance.rate}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  socialInsurance: {
                                    ...prev.socialInsurance,
                                    healthInsurance: {
                                      ...prev.socialInsurance.healthInsurance,
                                      rate: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                    }
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="decimal" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>健康保険 標準報酬月額上限</FormLabel>
                            <NumberInput
                              min={0}
                              value={draftTaxSchema.socialInsurance.healthInsurance.maxStandardRemuneration}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  socialInsurance: {
                                    ...prev.socialInsurance,
                                    healthInsurance: {
                                      ...prev.socialInsurance.healthInsurance,
                                      maxStandardRemuneration: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                    }
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="numeric" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>厚生年金保険料率</FormLabel>
                            <NumberInput
                              min={0}
                              step={0.001}
                              precision={4}
                              value={draftTaxSchema.socialInsurance.pension.rate}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  socialInsurance: {
                                    ...prev.socialInsurance,
                                    pension: {
                                      ...prev.socialInsurance.pension,
                                      rate: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                    }
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="decimal" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>厚生年金 標準報酬月額上限</FormLabel>
                            <NumberInput
                              min={0}
                              value={draftTaxSchema.socialInsurance.pension.maxStandardRemuneration}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  socialInsurance: {
                                    ...prev.socialInsurance,
                                    pension: {
                                      ...prev.socialInsurance.pension,
                                      maxStandardRemuneration: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                    }
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="numeric" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>雇用保険料率</FormLabel>
                            <NumberInput
                              min={0}
                              step={0.001}
                              precision={4}
                              value={draftTaxSchema.socialInsurance.employmentInsurance.rate}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  socialInsurance: {
                                    ...prev.socialInsurance,
                                    employmentInsurance: {
                                      rate: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                    }
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="decimal" />
                            </NumberInput>
                          </FormControl>
                        </VStack>
                      </Box>

                      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                        <Text fontWeight="bold" mb={3}>
                          所得控除額
                        </Text>
                        <VStack align="stretch" spacing={3}>
                          <FormControl>
                            <FormLabel>基礎控除</FormLabel>
                            <NumberInput
                              min={0}
                              value={draftTaxSchema.deductions.basic}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  deductions: {
                                    ...prev.deductions,
                                    basic: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="numeric" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>配偶者控除</FormLabel>
                            <NumberInput
                              min={0}
                              value={draftTaxSchema.deductions.spouse}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  deductions: {
                                    ...prev.deductions,
                                    spouse: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="numeric" />
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>扶養控除（1人あたり）</FormLabel>
                            <NumberInput
                              min={0}
                              value={draftTaxSchema.deductions.dependent}
                              onChange={(_, valueAsNumber): void =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  deductions: {
                                    ...prev.deductions,
                                    dependent: isNaN(valueAsNumber) ? 0 : valueAsNumber
                                  }
                                }))
                              }
                            >
                              <NumberInputField inputMode="numeric" />
                            </NumberInput>
                          </FormControl>
                        </VStack>
                      </Box>
                    </VStack>
                  )}
                </TabPanel>

                <TabPanel px={0} pt={0}>
                  <FormControl>
                    <FormLabel>税金ルールJSON</FormLabel>
                    <Textarea
                      minH="500px"
                      value={editorText}
                      onChange={(e): void => handleEditorChange(e.target.value)}
                      fontFamily="mono"
                      bg="white"
                    />
                  </FormControl>
                  {editorError && (
                    <Text mt={2} color="red.500" fontSize="sm">
                      {editorError}
                    </Text>
                  )}
                  <Text mt={2} color="gray.600" fontSize="xs">
                    JSONが有効である間は、編集内容が即時にダイアログ内へ反映されます。
                  </Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onCloseWithoutChanges}>
              変更せず閉じる
            </Button>
            <Button
              colorScheme="teal"
              onClick={(): void => {
                void handleConfirm()
              }}
              isLoading={isSubmitting}
              isDisabled={isConfirmDisabled}
            >
              変更を確定
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
