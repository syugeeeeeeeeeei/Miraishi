import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  UnorderedList,
  VStack,
  useToast
} from '@chakra-ui/react'
import { yaml as yamlLanguage } from '@codemirror/lang-yaml'
import { EditorView } from '@codemirror/view'
import type { SchemaValidationReport, TaxSchema, TaxSchemaV2 } from '@myTypes/miraishi'
import CodeMirror from '@uiw/react-codemirror'
import React, { useEffect, useMemo, useState } from 'react'
import { stringify } from 'yaml'

interface TaxRuleDialogProps {
  isOpen: boolean
  isLoading: boolean
  initialTaxSchema: TaxSchema | null
  onCloseWithoutChanges: () => void
  onApplied: (nextTaxSchema: TaxSchema) => Promise<void>
}

const YAML_EDITOR_FONT_FAMILY =
  "var(--chakra-fonts-body), 'Yu Gothic UI', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif"

const yamlEditorExtensions = [
  yamlLanguage(),
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
    paddingRight: '12px'
  },
  '.cm-gutters': {
    backgroundColor: '#f4f7fb',
    color: '#64748b',
    borderRight: '1px solid #d9e2ec',
    fontSize: '14px'
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
  }
})

const stringifySchema = (schema: TaxSchema): string => {
  return stringify(schema, {
    indent: 2,
    lineWidth: 0
  })
}

const classifyErrors = (errors: string[]): {
  syntax: string[]
  structure: string[]
  semantic: string[]
} => {
  const syntax: string[] = []
  const structure: string[] = []
  const semantic: string[] = []

  errors.forEach((error) => {
    if (error.includes('YAML構文エラー')) {
      syntax.push(error)
    } else if (error.includes('Invalid') || error.includes('required') || error.includes('expected')) {
      structure.push(error)
    } else {
      semantic.push(error)
    }
  })

  return { syntax, structure, semantic }
}

const resolveByDotPath = (source: unknown, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    return (current as Record<string, unknown>)[key]
  }, source)
}

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength)}...`
}

const formatSchemaValuePreview = (value: unknown): string => {
  if (value === undefined) {
    return '該当データなし'
  }
  if (value === null) {
    return 'null'
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return `${value.length} 件の配列`
  }
  if (typeof value === 'object') {
    try {
      return truncateText(
        stringify(value as Record<string, unknown>, {
          indent: 2,
          lineWidth: 0
        }).trim(),
        500
      )
    } catch {
      return 'オブジェクト'
    }
  }
  return String(value)
}

const formatFormulaExpressionPreview = (expression: unknown): string => {
  if (typeof expression === 'string') {
    return expression
  }
  try {
    return stringify(expression as Record<string, unknown>, {
      indent: 2,
      lineWidth: 0
    }).trim()
  } catch {
    return JSON.stringify(expression)
  }
}

type FormulaPreviewRow = {
  stepId: string
  expression: string
}

type SchemaItemPreviewRow = {
  itemKey: string
  name: string
  description: string
  valuePreview: string
  relatedFormulas: FormulaPreviewRow[]
}

export function TaxRuleDialog({
  isOpen,
  isLoading,
  initialTaxSchema,
  onCloseWithoutChanges,
  onApplied
}: TaxRuleDialogProps): React.JSX.Element {
  const toast = useToast()
  const [editorText, setEditorText] = useState<string>('')
  const [report, setReport] = useState<SchemaValidationReport | null>(null)
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false)
  const [isApplying, setIsApplying] = useState<boolean>(false)
  const [history, setHistory] = useState<{ id: string; lawVersion: string; createdAt: string; note: string }[]>(
    []
  )
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null)

  const parsedErrors = useMemo(() => classifyErrors(report?.errors ?? []), [report])
  const normalizedSchema = report?.normalizedSchema as TaxSchemaV2 | undefined
  const canApplySchema = Boolean(report?.isValid && report?.normalizedSchema)

  const formulaPreviewRows = useMemo<FormulaPreviewRow[]>(() => {
    if (!normalizedSchema) {
      return []
    }
    return normalizedSchema.formula.steps.map((step) => ({
      stepId: step.id,
      expression: formatFormulaExpressionPreview(step.expr)
    }))
  }, [normalizedSchema])

  const schemaItemPreviewRows = useMemo<SchemaItemPreviewRow[]>(() => {
    if (!normalizedSchema) {
      return []
    }

    const formulaMap = new Map<string, FormulaPreviewRow>(
      formulaPreviewRows.map((row) => [row.stepId, row] as const)
    )

    return Object.entries(normalizedSchema.uiMeta.items ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([itemKey, itemMeta]) => ({
        itemKey,
        name: itemMeta.name,
        description: itemMeta.description,
        valuePreview: formatSchemaValuePreview(resolveByDotPath(normalizedSchema, itemKey)),
        relatedFormulas: (itemMeta.formulaStepIds ?? [])
          .map((stepId) => formulaMap.get(stepId))
          .filter((row): row is FormulaPreviewRow => Boolean(row))
      }))
  }, [formulaPreviewRows, normalizedSchema])

  const loadHistory = async (): Promise<void> => {
    const result = await window.api.listTaxSchemaHistory()
    if (!result.success || !result.snapshots) {
      return
    }
    setActiveSnapshotId(result.activeSnapshotId ?? null)
    setHistory(
      result.snapshots
        .slice()
        .reverse()
        .map((snapshot) => ({
          id: snapshot.id,
          lawVersion: snapshot.lawVersion,
          createdAt: snapshot.createdAt,
          note: snapshot.note
        }))
    )
  }

  useEffect((): void => {
    if (!isOpen || !initialTaxSchema) {
      return
    }
    setEditorText(stringifySchema(initialTaxSchema))
    setReport(null)
    void loadHistory()
  }, [isOpen, initialTaxSchema])

  const runPreview = async (): Promise<SchemaValidationReport | null> => {
    setIsPreviewing(true)
    try {
      const result = await window.api.previewTaxSchema(editorText)
      if (!result.success || !result.report) {
        throw new Error(result.error ?? 'スキーマ検証に失敗しました。')
      }
      setReport(result.report)
      return result.report
    } catch (error) {
      toast({
        title: '検証に失敗しました。',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 2500,
        isClosable: true,
        position: 'bottom-right'
      })
      return null
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleApply = async (): Promise<void> => {
    setIsApplying(true)
    try {
      const latestReport = report ?? (await runPreview())
      if (!latestReport || !latestReport.isValid) {
        return
      }

      const result = await window.api.applyTaxSchema({
        yamlText: editorText,
        note: 'applied from editor dialog'
      })
      if (!result.success || !result.taxSchema) {
        throw new Error(result.error ?? '税制スキーマの適用に失敗しました。')
      }

      await onApplied(result.taxSchema)
      setEditorText(stringifySchema(result.taxSchema))
      setReport(result.report ?? latestReport)
      await loadHistory()

      toast({
        title: '税制スキーマを適用しました。',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    } catch (error) {
      toast({
        title: '適用に失敗しました。',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 2500,
        isClosable: true,
        position: 'bottom-right'
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleRestore = async (snapshotId: string): Promise<void> => {
    try {
      const result = await window.api.restoreTaxSchema(snapshotId)
      if (!result.success || !result.taxSchema) {
        throw new Error(result.error ?? '復元に失敗しました。')
      }
      await onApplied(result.taxSchema)
      setEditorText(stringifySchema(result.taxSchema))
      setReport(null)
      await loadHistory()

      toast({
        title: 'スキーマを復元しました。',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    } catch (error) {
      toast({
        title: '復元に失敗しました。',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 2500,
        isClosable: true,
        position: 'bottom-right'
      })
    }
  }

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
        <ModalHeader>税金ルール設定（YAML）</ModalHeader>
        <ModalCloseButton />

        <ModalBody overflowY="auto" maxH="72vh" pt={0} px={6} pb={6}>
          {isLoading && !initialTaxSchema ? (
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
                  エディター
                </Tab>
                <Tab
                  fontWeight="semibold"
                  color="gray.700"
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                  _selected={{ bg: 'teal.500', color: 'white' }}
                >
                  確認画面
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} pt={0}>
                  <Box
                    borderRadius="2xl"
                    p="1px"
                    bgGradient="linear(to-r, blue.200, cyan.100)"
                    boxShadow="0 18px 34px rgba(15, 23, 42, 0.11)"
                  >
                    <Box borderRadius="calc(var(--chakra-radii-2xl) - 1px)" overflow="hidden" bg="white">
                      <CodeMirror
                        value={editorText}
                        onChange={(value): void => {
                          setEditorText(value)
                          setReport(null)
                        }}
                        height="560px"
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
                </TabPanel>

                <TabPanel px={0} pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontWeight="bold">検証ステータス</Text>
                        <Badge colorScheme={report?.isValid ? 'green' : 'red'}>
                          {report ? (report.isValid ? 'VALID' : 'INVALID') : '未検証'}
                        </Badge>
                      </HStack>
                      <Divider my={3} />

                      <Text fontSize="sm" fontWeight="semibold" mb={1}>
                        構文結果
                      </Text>
                      {parsedErrors.syntax.length > 0 ? (
                        <UnorderedList spacing={1} pl={4} color="red.500" fontSize="sm">
                          {parsedErrors.syntax.map((error, index) => (
                            <ListItem key={`syntax-${index}`}>{error}</ListItem>
                          ))}
                        </UnorderedList>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          エラーなし
                        </Text>
                      )}

                      <Text fontSize="sm" fontWeight="semibold" mt={3} mb={1}>
                        構造検証結果
                      </Text>
                      {parsedErrors.structure.length > 0 ? (
                        <UnorderedList spacing={1} pl={4} color="red.500" fontSize="sm">
                          {parsedErrors.structure.map((error, index) => (
                            <ListItem key={`struct-${index}`}>{error}</ListItem>
                          ))}
                        </UnorderedList>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          エラーなし
                        </Text>
                      )}

                      <Text fontSize="sm" fontWeight="semibold" mt={3} mb={1}>
                        意味検証結果
                      </Text>
                      {parsedErrors.semantic.length > 0 ? (
                        <UnorderedList spacing={1} pl={4} color="red.500" fontSize="sm">
                          {parsedErrors.semantic.map((error, index) => (
                            <ListItem key={`semantic-${index}`}>{error}</ListItem>
                          ))}
                        </UnorderedList>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          エラーなし
                        </Text>
                      )}

                      {report?.warnings.length ? (
                        <>
                          <Text fontSize="sm" fontWeight="semibold" mt={3} mb={1}>
                            警告
                          </Text>
                          <UnorderedList spacing={1} pl={4} color="orange.500" fontSize="sm">
                            {report.warnings.map((warning, index) => (
                              <ListItem key={`warning-${index}`}>{warning}</ListItem>
                            ))}
                          </UnorderedList>
                        </>
                      ) : null}
                    </Box>

                    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                      <Text fontWeight="bold" mb={3}>
                        現行との差分サマリ
                      </Text>
                      {report?.diffSummary ? (
                        <VStack align="stretch" spacing={2} fontSize="sm">
                          <Text>追加: {report.diffSummary.added.length}</Text>
                          <Text>削除: {report.diffSummary.removed.length}</Text>
                          <Text>変更: {report.diffSummary.changed.length}</Text>
                          <Text>合計: {report.diffSummary.totalChanges}</Text>
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          まだ差分を計算していません。
                        </Text>
                      )}
                    </Box>

                    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                      <Text fontWeight="bold" mb={3}>
                        適用対象バージョン情報
                      </Text>
                      {report?.normalizedSchema ? (
                        <VStack align="stretch" spacing={1} fontSize="sm">
                          <Text>schemaVersion: {report.normalizedSchema.schemaVersion}</Text>
                          <Text>version: {report.normalizedSchema.version}</Text>
                          <Text>effectiveFrom: {report.normalizedSchema.effectiveFrom}</Text>
                          <Text>
                            effectiveTo:{' '}
                            {report.normalizedSchema.effectiveTo ? report.normalizedSchema.effectiveTo : 'null'}
                          </Text>
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          まだ検証していません。
                        </Text>
                      )}
                    </Box>

                    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                      <Text fontWeight="bold" mb={3}>
                        項目定義・計算式（アコーディオン）
                      </Text>
                      {normalizedSchema ? (
                        <Accordion allowMultiple defaultIndex={[0]}>
                          {schemaItemPreviewRows.length > 0 ? (
                            schemaItemPreviewRows.map((row) => (
                              <AccordionItem key={row.itemKey}>
                                <h2>
                                  <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                      <Text fontWeight="semibold">{row.name}</Text>
                                      <Text fontSize="xs" color="gray.600">
                                        {row.itemKey}
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  <VStack align="stretch" spacing={3}>
                                    <Text fontSize="sm" color="gray.700">
                                      {row.description}
                                    </Text>
                                    <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={3}>
                                      <Text fontSize="xs" color="gray.600" mb={1}>
                                        現在値
                                      </Text>
                                      <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono">
                                        {row.valuePreview}
                                      </Text>
                                    </Box>
                                    <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={3}>
                                      <Text fontSize="xs" color="gray.600" mb={1}>
                                        関連計算式
                                      </Text>
                                      {row.relatedFormulas.length > 0 ? (
                                        <VStack align="stretch" spacing={2}>
                                          {row.relatedFormulas.map((formula) => (
                                            <Box key={`${row.itemKey}-${formula.stepId}`}>
                                              <Text fontSize="xs" color="gray.600">
                                                {formula.stepId}
                                              </Text>
                                              <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono">
                                                {formula.expression}
                                              </Text>
                                            </Box>
                                          ))}
                                        </VStack>
                                      ) : (
                                        <Text fontSize="sm" color="gray.600">
                                          関連づく計算式は未設定です。
                                        </Text>
                                      )}
                                    </Box>
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            ))
                          ) : (
                            <Text fontSize="sm" color="gray.600" px={2} py={2}>
                              `uiMeta.items` に項目定義がありません。
                            </Text>
                          )}

                          <AccordionItem>
                            <h2>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <Text fontWeight="semibold">全計算式一覧</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    formula.steps
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                              {formulaPreviewRows.length > 0 ? (
                                <VStack align="stretch" spacing={3}>
                                  {formulaPreviewRows.map((formula) => (
                                    <Box
                                      key={`formula-${formula.stepId}`}
                                      bg="gray.50"
                                      borderWidth="1px"
                                      borderColor="gray.200"
                                      borderRadius="md"
                                      p={3}
                                    >
                                      <Text fontSize="xs" color="gray.600" mb={1}>
                                        {formula.stepId}
                                      </Text>
                                      <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono">
                                        {formula.expression}
                                      </Text>
                                    </Box>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontSize="sm" color="gray.600">
                                  計算式がありません。
                                </Text>
                              )}
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          まだ検証していません。
                        </Text>
                      )}
                    </Box>

                    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                      <Text fontWeight="bold" mb={3}>
                        過去スキーマ履歴
                      </Text>
                      {history.length > 0 ? (
                        <VStack align="stretch" spacing={2}>
                          {history.map((snapshot) => (
                            <HStack key={snapshot.id} justifyContent="space-between" alignItems="flex-start">
                              <VStack align="stretch" spacing={0} fontSize="sm">
                                <Text fontWeight="semibold">
                                  {snapshot.lawVersion}{' '}
                                  {snapshot.id === activeSnapshotId ? '(active)' : ''}
                                </Text>
                                <Text color="gray.600">{snapshot.createdAt}</Text>
                                <Text color="gray.600">{snapshot.note || '-'}</Text>
                              </VStack>
                              <Button
                                size="xs"
                                variant="outline"
                                isDisabled={snapshot.id === activeSnapshotId}
                                onClick={(): void => {
                                  void handleRestore(snapshot.id)
                                }}
                              >
                                復元
                              </Button>
                            </HStack>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.600">
                          履歴はありません。
                        </Text>
                      )}
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onCloseWithoutChanges}>
              閉じる
            </Button>
            <Button
              variant="outline"
              onClick={(): void => {
                void runPreview()
              }}
              isLoading={isPreviewing}
            >
              確認を更新
            </Button>
            <Button
              colorScheme="teal"
              onClick={(): void => {
                void handleApply()
              }}
              isLoading={isApplying}
              isDisabled={isLoading || isPreviewing || !canApplySchema}
            >
              変更を適用
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
