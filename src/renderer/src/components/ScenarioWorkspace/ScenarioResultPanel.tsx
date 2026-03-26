import React from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import type { PredictionResult } from '@myTypes/miraishi'
import { PredictionResultTable } from './PredictionResultTable'

interface ScenarioResultPanelProps {
  predictionResult: PredictionResult | null
  predictionPeriod: number
}

export const ScenarioResultPanel = ({
  predictionResult,
  predictionPeriod
}: ScenarioResultPanelProps): React.JSX.Element => (
  <Box h="100%" w="100%" overflowY="auto" p={{ base: 3, md: 6 }}>
    {predictionResult && predictionResult.details.length > 0 ? (
      <PredictionResultTable result={predictionResult} predictionPeriod={predictionPeriod} />
    ) : (
      <Flex align="center" justify="center" h="100%">
        <Text color="gray.500">計算結果はありません。</Text>
      </Flex>
    )}
  </Box>
)
