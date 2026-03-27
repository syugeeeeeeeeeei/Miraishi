import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Text,
  VStack
} from '@chakra-ui/react'
import type {
  Scenario,
  ScenarioComparisonPdfExportRequest,
  ScenarioComparisonPdfIncludeSections
} from '@myTypes/miraishi'

interface ScenarioComparisonPdfDialogProps {
  isOpen: boolean
  isExporting: boolean
  scenarios: Scenario[]
  defaultScenarioIds: string[]
  defaultUntilYear: number
  defaultAverageOvertimeHours: number
  onClose: () => void
  onExport: (payload: ScenarioComparisonPdfExportRequest) => Promise<void>
}

const createDefaultIncludeSections = (): ScenarioComparisonPdfIncludeSections => ({
  conditions: true,
  yearlyComparison: true,
  growthSummary: true,
  scenarioDetails: true,
  taxMeta: true
})

export function ScenarioComparisonPdfDialog({
  isOpen,
  isExporting,
  scenarios,
  defaultScenarioIds,
  defaultUntilYear,
  defaultAverageOvertimeHours,
  onClose,
  onExport
}: ScenarioComparisonPdfDialogProps): React.JSX.Element {
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([])
  const [untilYear, setUntilYear] = useState<number>(10)
  const [averageOvertimeHours, setAverageOvertimeHours] = useState<number>(0)
  const [includeSections, setIncludeSections] = useState<ScenarioComparisonPdfIncludeSections>(
    createDefaultIncludeSections()
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const fallbackScenarioIds = scenarios.slice(0, 2).map((scenario) => scenario.id)
    setSelectedScenarioIds(defaultScenarioIds.length > 0 ? defaultScenarioIds : fallbackScenarioIds)
    setUntilYear(Math.min(50, Math.max(1, Math.trunc(defaultUntilYear || 10))))
    setAverageOvertimeHours(Math.max(0, Number(defaultAverageOvertimeHours || 0)))
    setIncludeSections(createDefaultIncludeSections())
  }, [isOpen, scenarios, defaultScenarioIds, defaultUntilYear, defaultAverageOvertimeHours])

  const canExport = useMemo(() => {
    const hasSections = Object.values(includeSections).some(Boolean)
    return (
      selectedScenarioIds.length >= 2 &&
      untilYear >= 1 &&
      untilYear <= 50 &&
      averageOvertimeHours >= 0 &&
      hasSections &&
      !isExporting
    )
  }, [selectedScenarioIds.length, untilYear, averageOvertimeHours, includeSections, isExporting])

  const toggleScenario = (scenarioId: string): void => {
    setSelectedScenarioIds((current) => {
      if (current.includes(scenarioId)) {
        return current.filter((id) => id !== scenarioId)
      }
      return [...current, scenarioId]
    })
  }

  const handleExportClick = (): void => {
    if (!canExport) {
      return
    }
    void onExport({
      scenarioIds: selectedScenarioIds,
      untilYear,
      averageOvertimeHours,
      includeSections
    })
  }

  const sectionOptions: Array<{ key: keyof ScenarioComparisonPdfIncludeSections; label: string }> = [
    { key: 'conditions', label: '条件比較サマリ' },
    { key: 'yearlyComparison', label: '年次比較テーブル' },
    { key: 'growthSummary', label: '成長指標サマリ' },
    { key: 'scenarioDetails', label: 'シナリオ別詳細' },
    { key: 'taxMeta', label: '税制スキーマ情報' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={isExporting ? () => undefined : onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>比較レポート（PDF）出力</ModalHeader>
        <ModalCloseButton isDisabled={isExporting} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="sm" color="gray.600">
              複数シナリオの条件比較と指定年までの推移をPDFに出力します。
            </Text>

            <FormControl>
              <FormLabel mb={2}>出力対象シナリオ（2件以上）</FormLabel>
              <Box maxH="170px" overflowY="auto" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={3}>
                <VStack align="stretch" spacing={2}>
                  {scenarios.map((scenario) => (
                    <Checkbox
                      key={scenario.id}
                      isChecked={selectedScenarioIds.includes(scenario.id)}
                      onChange={(): void => toggleScenario(scenario.id)}
                    >
                      {scenario.title}
                    </Checkbox>
                  ))}
                </VStack>
              </Box>
              <Text mt={1} fontSize="xs" color={selectedScenarioIds.length >= 2 ? 'gray.600' : 'red.500'}>
                選択中: {selectedScenarioIds.length}件
              </Text>
            </FormControl>

            <HStack spacing={4} align="flex-start">
              <FormControl>
                <FormLabel>比較対象年（N年目まで）</FormLabel>
                <NumberInput
                  value={untilYear}
                  min={1}
                  max={50}
                  onChange={(_, valueAsNumber): void => setUntilYear(isNaN(valueAsNumber) ? 1 : valueAsNumber)}
                >
                  <NumberInputField inputMode="numeric" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>月平均残業時間</FormLabel>
                <NumberInput
                  value={averageOvertimeHours}
                  min={0}
                  max={500}
                  precision={1}
                  step={0.5}
                  onChange={(_, valueAsNumber): void =>
                    setAverageOvertimeHours(isNaN(valueAsNumber) ? 0 : valueAsNumber)
                  }
                >
                  <NumberInputField inputMode="decimal" />
                </NumberInput>
              </FormControl>
            </HStack>

            <Divider />

            <FormControl>
              <FormLabel>出力セクション</FormLabel>
              <VStack align="stretch" spacing={2}>
                {sectionOptions.map((option) => (
                  <Checkbox
                    key={option.key}
                    isChecked={includeSections[option.key]}
                    onChange={(e): void =>
                      setIncludeSections((current) => ({
                        ...current,
                        [option.key]: e.target.checked
                      }))
                    }
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button onClick={onClose} variant="ghost" isDisabled={isExporting}>
              キャンセル
            </Button>
            <Button colorScheme="teal" onClick={handleExportClick} isLoading={isExporting} isDisabled={!canExport}>
              PDFを書き出す
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

