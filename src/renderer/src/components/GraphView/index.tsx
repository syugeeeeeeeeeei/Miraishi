/**
 * @file src/renderer/src/components/GraphView/index.tsx
 * @description 計算結果をグラフで表示するドロワーコンポーネント
 */
import React, { useEffect, useState, useTransition } from 'react'
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex } from '@chakra-ui/react'
import { useAtom, useSetAtom } from 'jotai'
import {
  activeScenariosAtom,
  calculatePredictionsAtom,
  graphViewSettingsAtom,
  isGraphViewVisibleAtom,
  predictionResultsAtom
} from '@renderer/store/atoms'
import { GraphChartPanel } from './GraphChartPanel'
import { GraphSettingsPanel } from './GraphSettingsPanel'
import { buildChartOptions, CHART_FONT_FAMILY } from './chartConfig'

const CHART_OPTIONS = buildChartOptions(CHART_FONT_FAMILY)

export function GraphView(): React.JSX.Element {
  const [isOpen, setIsOpen] = useAtom(isGraphViewVisibleAtom)
  const [results] = useAtom(predictionResultsAtom)
  const [settings, setSettings] = useAtom(graphViewSettingsAtom)
  const [activeScenarios] = useAtom(activeScenariosAtom)
  const calculatePredictions = useSetAtom(calculatePredictionsAtom)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [isChartFontReady, setIsChartFontReady] = useState<boolean>(false)
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

  const handleDisplayItemsChange = (values: string[]): void => {
    startTransition(() => {
      setSettings({
        ...settings,
        displayItem: values as ('grossAnnual' | 'netAnnual')[]
      })
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

  useEffect((): (() => void) => {
    let isMounted = true

    const waitForFonts = async (): Promise<void> => {
      if (!('fonts' in document)) {
        if (isMounted) setIsChartFontReady(true)
        return
      }
      try {
        await document.fonts.ready
      } finally {
        if (isMounted) setIsChartFontReady(true)
      }
    }

    waitForFonts()

    return (): void => {
      isMounted = false
    }
  }, [])

  if (!results && !isCalculating) {
    return <></>
  }

  const displayItems = settings.displayItem as ('grossAnnual' | 'netAnnual')[]

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={(): void => setIsOpen(false)} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">グラフビュー</DrawerHeader>
        <DrawerBody>
          <Flex h="100%">
            <GraphChartPanel
              results={results}
              activeScenarios={activeScenarios}
              displayItems={displayItems}
              isCalculating={isCalculating}
              isChartFontReady={isChartFontReady}
              options={CHART_OPTIONS}
            />
            <GraphSettingsPanel
              settings={settings}
              isPending={isPending}
              onPeriodChangeEnd={(value): void => handleSliderChangeEnd('period', value)}
              onOvertimeChangeEnd={(value): void => handleSliderChangeEnd('overtime', value)}
              onDisplayItemsChange={handleDisplayItemsChange}
            />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
