/**
 * @file src/renderer/src/components/GraphView.tsx
 * @description 計算結果をグラフで表示するドロワーコンポーネント
 */
import React, { useEffect, useState, useTransition } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Flex,
  VStack,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Heading,
  Badge,
  CheckboxGroup,
  Stack,
  Checkbox,
  Spinner
} from '@chakra-ui/react'
import { useAtom, useSetAtom } from 'jotai'
import {
  isGraphViewVisibleAtom,
  predictionResultsAtom,
  graphViewSettingsAtom,
  calculatePredictionsAtom,
  activeScenariosAtom
} from '@renderer/store/atoms'
import { Line } from 'react-chartjs-2'
import type { ChartData } from 'chart.js'
import type { Scenario } from '@myTypes/miraishi'

const CHART_COLORS = [
  'rgb(255, 99, 132)', // Red
  'rgb(54, 162, 235)', // Blue
  'rgb(255, 205, 86)', // Yellow
  'rgb(75, 192, 192)', // Green
  'rgb(153, 102, 255)' // Purple
]

export function GraphView(): React.JSX.Element {
  const [isOpen, setIsOpen] = useAtom(isGraphViewVisibleAtom)
  const [results] = useAtom(predictionResultsAtom)
  const [settings, setSettings] = useAtom(graphViewSettingsAtom)
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const handleSliderChangeEnd = (type: 'period' | 'overtime', value: number): void => {
    startTransition(() => {
      if (type === 'period') {
        setSettings({ ...settings, predictionPeriod: value })
      } else {
        setSettings({ ...settings, averageOvertimeHours: value })
      }
    })
  }

  useEffect((): void => {
    const handleRecalculate = async (): Promise<void> => {
      if (activeScenarios.length > 0) {
        setIsCalculating(true)
        await calculatePredictions()
        setIsCalculating(false)
      }
    }
    handleRecalculate()
  }, [settings, calculatePredictions, activeScenarios.length])

  if (!results && !isCalculating) {
    return <></>
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '年収推移予測' }
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: string | number) {
            return (Number(value) / 10000).toLocaleString() + '万円'
          }
        }
      }
    }
  }

  const scenarioMap = new Map<string, Scenario>(activeScenarios.map((s) => [s.id, s]))

  const chartData: ChartData<'line'> = {
    labels: results[0]?.result.details.map((d) => `${d.year}年目`) || [],
    datasets: results.flatMap((res) => {
      const scenario = scenarioMap.get(res.scenarioId)
      if (!scenario) return []

      const color =
        CHART_COLORS[activeScenarios.findIndex((s) => s.id === scenario.id) % CHART_COLORS.length]

      return (settings.displayItem as ('grossAnnual' | 'netAnnual')[]).map((itemKey) => {
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
    <Drawer isOpen={isOpen} placement="right" onClose={(): void => setIsOpen(false)} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">グラフビュー</DrawerHeader>
        <DrawerBody>
          <Flex h="100%">
            <Box flex="0.7" pr={8} position="relative">
              {(isCalculating || (results.length === 0 && activeScenarios.length > 0)) && (
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
              {results.length > 0 && (
                <Box position="relative" h="400px">
                  <Line options={options} data={chartData} />
                </Box>
              )}
            </Box>

            <Box flex="0.3" borderLeftWidth="1px" pl={8} opacity={isPending ? 0.7 : 1}>
              <VStack spacing={6} align="stretch">
                <Heading size="md">表示設定</Heading>
                <FormControl>
                  <FormLabel>
                    予測期間: <Badge colorScheme="teal">{settings.predictionPeriod}年</Badge>
                  </FormLabel>
                  <Slider
                    defaultValue={settings.predictionPeriod}
                    onChangeEnd={(val) => handleSliderChangeEnd('period', val)}
                    min={1}
                    max={50}
                    step={1}
                    isDisabled={isPending}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel>
                    月平均の残業時間:{' '}
                    <Badge colorScheme="orange">{settings.averageOvertimeHours}時間</Badge>
                  </FormLabel>
                  <Slider
                    defaultValue={settings.averageOvertimeHours}
                    onChangeEnd={(val) => handleSliderChangeEnd('overtime', val)}
                    min={0}
                    max={100}
                    step={1}
                    isDisabled={isPending}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel>表示項目</FormLabel>
                  <CheckboxGroup
                    colorScheme="green"
                    value={settings.displayItem}
                    onChange={(values): void =>
                      startTransition((): void => {
                        setSettings({
                          ...settings,
                          displayItem: values as ('grossAnnual' | 'netAnnual')[]
                        })
                      })
                    }
                  >
                    <Stack spacing={[1, 5]} direction={'column'}>
                      <Checkbox value="grossAnnual">年収(額面)</Checkbox>
                      <Checkbox value="netAnnual">年収(手取り)</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </Box>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
