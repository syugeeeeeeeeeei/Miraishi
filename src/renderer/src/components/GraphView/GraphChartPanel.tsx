import React from 'react'
import { Box, Flex, Spinner } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import type { PredictionResult, Scenario } from '@myTypes/miraishi'
import { CHART_COLORS } from './chartConfig'

interface GraphChartPanelProps {
  results: { scenarioId: string; result: PredictionResult }[]
  activeScenarios: Scenario[]
  displayItems: ('grossAnnual' | 'netAnnual')[]
  isCalculating: boolean
  isChartFontReady: boolean
  options: ChartOptions<'line'>
}

export function GraphChartPanel({
  results,
  activeScenarios,
  displayItems,
  isCalculating,
  isChartFontReady,
  options
}: GraphChartPanelProps): React.JSX.Element {
  const scenarioMap = new Map<string, Scenario>(activeScenarios.map((s) => [s.id, s]))

  const chartData: ChartData<'line'> = {
    labels: results[0]?.result.details.map((d) => `${d.year}年目`) || [],
    datasets: results.flatMap((res) => {
      const scenario = scenarioMap.get(res.scenarioId)
      if (!scenario) return []

      const color =
        CHART_COLORS[activeScenarios.findIndex((s) => s.id === scenario.id) % CHART_COLORS.length]

      return displayItems.map((itemKey) => {
        const dataMap = {
          grossAnnual: {
            label: `${scenario.title} (額面)`,
            data: res.result.details.map((d) => d.grossAnnualIncome)
          },
          netAnnual: {
            label: `${scenario.title} (手取り)`,
            data: res.result.details.map((d) => d.netAnnualIncome)
          }
        }
        return {
          label: dataMap[itemKey]?.label || '不明',
          data: dataMap[itemKey]?.data || [],
          borderColor: color,
          backgroundColor: color.replace(')', ', 0.5)').replace('rgb', 'rgba')
        }
      })
    })
  }

  return (
    <Box flex="0.7" pr={8} position="relative">
      {(!isChartFontReady || isCalculating || (results.length === 0 && activeScenarios.length > 0)) && (
        <Flex
          position="absolute"
          w="100%"
          h="100%"
          align="center"
          justify="center"
          bg="rgba(255,255,255,0.7)"
          zIndex="10"
        >
          <Spinner size="xl" />
        </Flex>
      )}
      {results.length > 0 && isChartFontReady && (
        <Box position="relative" h="400px">
          <Line options={options} data={chartData} />
        </Box>
      )}
    </Box>
  )
}
