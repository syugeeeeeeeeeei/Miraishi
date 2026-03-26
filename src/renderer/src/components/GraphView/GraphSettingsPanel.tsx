import React from 'react'
import {
  Badge,
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  VStack
} from '@chakra-ui/react'
import type { GraphViewSettings } from '@myTypes/miraishi'

interface GraphSettingsPanelProps {
  settings: GraphViewSettings
  isPending: boolean
  onPeriodChangeEnd: (value: number) => void
  onOvertimeChangeEnd: (value: number) => void
  onDisplayItemsChange: (values: string[]) => void
}

export function GraphSettingsPanel({
  settings,
  isPending,
  onPeriodChangeEnd,
  onOvertimeChangeEnd,
  onDisplayItemsChange
}: GraphSettingsPanelProps): React.JSX.Element {
  return (
    <Box flex="0.3" borderLeftWidth="1px" pl={8} opacity={isPending ? 0.7 : 1}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">表示設定</Heading>
        <FormControl>
          <FormLabel>
            予測期間: <Badge colorScheme="teal">{settings.predictionPeriod}年</Badge>
          </FormLabel>
          <Slider
            defaultValue={settings.predictionPeriod}
            onChangeEnd={onPeriodChangeEnd}
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
            月平均の残業時間: <Badge colorScheme="orange">{settings.averageOvertimeHours}時間</Badge>
          </FormLabel>
          <Slider
            defaultValue={settings.averageOvertimeHours}
            onChangeEnd={onOvertimeChangeEnd}
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
            onChange={(values): void => onDisplayItemsChange(values as string[])}
          >
            <Stack spacing={[1, 5]} direction="column">
              <Checkbox value="grossAnnual">年収(額面)</Checkbox>
              <Checkbox value="netAnnual">年収(手取り)</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
      </VStack>
    </Box>
  )
}
