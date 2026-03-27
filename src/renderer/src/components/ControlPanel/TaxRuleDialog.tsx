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
  VStack
} from '@chakra-ui/react'
import { yaml as yamlLanguage } from '@codemirror/lang-yaml'
import { EditorView } from '@codemirror/view'
import type { TaxSchema } from '@myTypes/miraishi'
import CodeMirror from '@uiw/react-codemirror'
import React, { useEffect, useState } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { parseDocument } from 'yaml'

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

const quoteYamlString = (value: string): string => `'${value.replace(/'/g, "''")}'`

const YAML_EDITOR_FONT_FAMILY =
  "var(--chakra-fonts-body), 'Yu Gothic UI', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif"

const yamlEditorExtensions = [
  yamlLanguage(),
  // highlightWhitespace(),
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({
    spellcheck: 'false',
    autocorrect: 'off',
    autocapitalize: 'off',
    'data-gramm': 'false'
  })
]

const yamlEditorTheme = EditorView.theme({
  '&': {
    fontFamily: YAML_EDITOR_FONT_FAMILY,
    fontSize: '15px',
    backgroundColor: '#fbfcff'
  },
  '.cm-scroller': {
    fontFamily: YAML_EDITOR_FONT_FAMILY,
    lineHeight: '1.5'
  },
  '.cm-content': {
    letterSpacing: '0.012em',
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  '.cm-line': {
    paddingLeft: '6px',
    paddingRight: '12px',
  },
  '.cm-gutters': {
    backgroundColor: '#f4f7fb',
    color: '#64748b',
    borderRight: '1px solid #d9e2ec',
    fontSize: '14px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#eaf2ff',
    color: '#334155'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(37, 99, 235, 0.08)'
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(14, 116, 144, 0.20)'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#0284c7'
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#e8edf5',
    border: '1px solid #cbd5e1',
    color: '#475569'
  },
  '.cm-comment': {
    color: '#64748b'
  },
  '.cm-string': {
    color: '#0f766e'
  },
  '.cm-number': {
    color: '#7c3aed'
  },
  '.cm-propertyName': {
    color: '#0b4f92',
    fontWeight: '600'
  }
})

const toTaxSchemaYamlText = (schema: TaxSchema): string => {
  const lines: string[] = [
    '# =============================',
    '# 税金ルール設定 (YAML)',
    '# 税率は 0.1 = 10% の小数で指定します。',
    '# =============================',
    '',
    '# バージョン',
    `version: ${quoteYamlString(schema.version)}`,
    '',
    '# 所得税率テーブル（課税所得の帯）',
    'incomeTaxRates:',
    '  # threshold は課税所得の上限です。null は上限なし（最終帯）を表します。'
  ]

  for (const [index, rate] of schema.incomeTaxRates.entries()) {
    lines.push(`  # ${index + 1}段目`)
    lines.push(`  - threshold: ${rate.threshold === null ? 'null' : rate.threshold}`)
    lines.push(`    rate: ${rate.rate}`)
    lines.push(`    deduction: ${rate.deduction}`)
    if (index < schema.incomeTaxRates.length - 1) {
      lines.push('')
    }
  }

  lines.push('')
  lines.push('# 住民税率')
  lines.push('residentTaxRate: ' + schema.residentTaxRate)
  lines.push('')
  lines.push('# 社会保険')
  lines.push('socialInsurance:')
  lines.push('  # maxStandardRemuneration は標準報酬月額の上限値です。')
  lines.push('  healthInsurance:')
  lines.push(`    rate: ${schema.socialInsurance.healthInsurance.rate}`)
  lines.push(
    `    maxStandardRemuneration: ${schema.socialInsurance.healthInsurance.maxStandardRemuneration}`
  )
  lines.push('  pension:')
  lines.push(`    rate: ${schema.socialInsurance.pension.rate}`)
  lines.push(`    maxStandardRemuneration: ${schema.socialInsurance.pension.maxStandardRemuneration}`)
  lines.push('  employmentInsurance:')
  lines.push(`    rate: ${schema.socialInsurance.employmentInsurance.rate}`)
  lines.push('')
  lines.push('# 所得控除額（年間）')
  lines.push('deductions:')
  lines.push(`  basic: ${schema.deductions.basic}`)
  lines.push(`  spouse: ${schema.deductions.spouse}`)
  lines.push(`  dependent: ${schema.deductions.dependent}`)

  return `${lines.join('\n')}\n`
}

const parseTaxSchemaFromText = (
  yamlText: string
): { schema: TaxSchema | null; error: string | null } => {
  const document = parseDocument(yamlText)
  if (document.errors.length > 0) {
    const firstError = document.errors[0]
    return { schema: null, error: `YAMLの構文エラーがあります。${firstError.message}` }
  }

  const parsed = document.toJS()
  if (!isTaxSchemaObject(parsed)) {
    return {
      schema: null,
      error: '税金ルールYAMLの形式が不正です。必須フィールドと数値型を確認してください。'
    }
  }

  return { schema: parsed, error: null }
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
    setEditorText(toTaxSchemaYamlText(nextDraft))
    setEditorError(null)
  }, [isOpen, initialTaxSchema])

  const updateDraft = (updater: (prev: TaxSchema) => TaxSchema): void => {
    setDraftTaxSchema((prev) => {
      if (!prev) {
        return prev
      }
      const next = updater(prev)
      setEditorText(toTaxSchemaYamlText(next))
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

  const handleNormalizeEditorText = (): void => {
    if (!draftTaxSchema) {
      return
    }
    setEditorText(toTaxSchemaYamlText(draftTaxSchema))
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
                  YAMLエディットモード
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
                    <HStack mb={2} justifyContent="space-between" alignItems="center">
                      <FormLabel mb={0} fontSize="sm" color="gray.700" fontWeight="semibold">
                        税金ルールYAML
                      </FormLabel>
                      <Button
                        size="xs"
                        variant="ghost"
                        borderRadius="full"
                        px={3}
                        bg="white"
                        _hover={{ bg: 'gray.100' }}
                        onClick={handleNormalizeEditorText}
                        isDisabled={!draftTaxSchema}
                      >
                        フォーマット
                      </Button>
                    </HStack>
                    <Box
                      borderRadius="2xl"
                      p="1px"
                      bgGradient={
                        editorError
                          ? 'linear(to-r, red.200, orange.100)'
                          : 'linear(to-r, blue.200, cyan.100)'
                      }
                      boxShadow="0 18px 34px rgba(15, 23, 42, 0.11)"
                    >
                      <Box borderRadius="calc(var(--chakra-radii-2xl) - 1px)" overflow="hidden" bg="white">
                        <HStack
                          px={4}
                          py={2.5}
                          borderBottomWidth="1px"
                          borderColor={editorError ? 'red.100' : 'blue.100'}
                          bgGradient="linear(to-r, white, #f8fbff)"
                          justifyContent="space-between"
                        >
                          <HStack spacing={2}>
                            <Text fontSize="xs" fontWeight="bold" letterSpacing="0.08em" color="gray.600">
                              YAML EDITOR
                            </Text>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={editorError ? 'red.500' : 'teal.600'}
                            fontWeight="semibold"
                          >
                            {editorError ? '構文エラーあり' : '構文OK'}
                          </Text>
                        </HStack>
                        <CodeMirror
                          value={editorText}
                          onChange={(value): void => handleEditorChange(value)}
                          height="550px"
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                            highlightActiveLineGutter: true,
                            bracketMatching: true,
                            indentOnInput: true,
                            tabSize: 2
                          }}
                          extensions={yamlEditorExtensions}
                          theme={yamlEditorTheme}
                        />
                      </Box>
                    </Box>
                  </FormControl>
                  {editorError && (
                    <Text mt={2} color="red.500" fontSize="sm">
                      {editorError}
                    </Text>
                  )}
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
