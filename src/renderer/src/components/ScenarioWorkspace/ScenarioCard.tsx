/**
 * @file src/renderer/src/components/ScenarioWorkspace/ScenarioCard.tsx
 * @description 入力ビューと結果ビューを切り替えるカードUIのコンテナ
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Flex, Grid, Input, useToast } from '@chakra-ui/react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  calculatePredictionsAtom,
  graphViewSettingsAtom,
  updateScenarioAtom
} from '@renderer/store/atoms'
import type { Allowance, PredictionResult, Scenario } from '@myTypes/miraishi'
import { v4 as uuidv4 } from 'uuid'
import { ScenarioInputForm } from './ScenarioInputForm'
import { ScenarioResultPanel } from './ScenarioResultPanel'

interface ScenarioCardProps {
  scenario: Scenario
  predictionResult: PredictionResult | null
}

export function ScenarioCard({ scenario, predictionResult }: ScenarioCardProps): React.JSX.Element {
  const updateScenario = useSetAtom(updateScenarioAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [editableScenario, setEditableScenario] = useState<Scenario>(scenario)
  const toast = useToast()
  const graphViewSettings = useAtomValue(graphViewSettingsAtom)

  useEffect((): void => {
    setEditableScenario(scenario)
  }, [scenario])

  const updateNestedState = useCallback((path: string, value: any): void => {
    setEditableScenario((prev) => {
      const keys = path.split('.')
      const newState = JSON.parse(JSON.stringify(prev))
      let current = newState
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newState
    })
  }, [])

  const handleSaveAndRecalculate = useCallback((): void => {
    if (JSON.stringify(editableScenario) !== JSON.stringify(scenario)) {
      updateScenario(editableScenario)
      calculatePredictions()
      toast({
        title: '自動保存・再計算が実行されました。',
        description: `「${editableScenario.title}」の変更が反映されました。`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    }
  }, [editableScenario, scenario, updateScenario, calculatePredictions, toast])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  const addAllowance = useCallback((): void => {
    const newAllowance: Allowance = {
      id: uuidv4(),
      name: '新規手当',
      type: 'fixed',
      amount: 10000,
      duration: { type: 'unlimited' }
    }
    setEditableScenario((prev) => ({
      ...prev,
      allowances: [...(prev.allowances ?? []), newAllowance]
    }))
  }, [])

  const removeAllowance = useCallback((index: number): void => {
    setEditableScenario((prev) => ({
      ...prev,
      allowances: (prev.allowances ?? []).filter((_, i) => i !== index)
    }))
  }, [])

  return (
    <Flex
      h="100%"
      w="100%"
      bg="brand.base"
      borderRadius="lg"
      boxShadow="lg"
      flexDirection="column"
      onBlur={(e: React.FocusEvent<HTMLDivElement>): void => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleSaveAndRecalculate()
        }
      }}
    >
      <Box p={4} borderBottom="1px solid" borderColor="gray.300" flexShrink={0} bg="brand.darkBase">
        <Input
          variant="flushed"
          fontWeight="bold"
          fontSize="2xl"
          placeholder="シナリオ名"
          w="100%"
          maxW="720px"
          borderBottomColor="gray.400"
          _hover={{ borderColor: 'gray.600' }}
          _focus={{ borderColor: 'brand.accent' }}
          value={editableScenario.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            updateNestedState('title', e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </Box>

      <Box flex="1" minH={0}>
        <Grid
          h="100%"
          minH={0}
          templateColumns={{ base: '1fr', xl: 'minmax(0, 1.25fr) minmax(0, 0.95fr)' }}
          templateRows={{ base: 'minmax(0, 1fr) minmax(0, 1fr)', xl: '1fr' }}
          bg="gray.100"
        >
          <Box minW={0} minH={0} bg="gray.50">
            <ScenarioInputForm
              scenario={editableScenario}
              updateNestedState={updateNestedState}
              handleKeyDown={handleKeyDown}
              addAllowance={addAllowance}
              removeAllowance={removeAllowance}
            />
          </Box>
          <Box
            minW={0}
            minH={0}
            bg="gray.50"
            borderColor="gray.200"
            borderTopWidth={{ base: '1px', xl: '0px' }}
            borderLeftWidth={{ base: '0px', xl: '1px' }}
          >
            <ScenarioResultPanel
              predictionResult={predictionResult}
              predictionPeriod={graphViewSettings.predictionPeriod}
            />
          </Box>
        </Grid>
      </Box>
    </Flex>
  )
}
