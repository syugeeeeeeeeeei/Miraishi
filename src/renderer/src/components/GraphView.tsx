/**
 * @file src/renderer/src/components/GraphView.tsx
 * @description 計算結果をグラフで表示するドロワーコンポーネント
 */
import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { isGraphViewVisibleAtom, predictionResultAtom } from '@renderer/store/atoms'
import { Line } from 'react-chartjs-2'

export function GraphView(): React.JSX.Element {
  const [isOpen, setIsOpen] = useAtom(isGraphViewVisibleAtom)
  const [result] = useAtom(predictionResultAtom)

  if (!result) {
    return <></> // 結果がなければ何も描画しない
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '年収推移予測' }
    }
  }

  const labels = result.details.map((d) => `${d.year}年目`)
  const data = {
    labels,
    datasets: [
      {
        label: '年収(額面)',
        data: result.details.map((d) => d.grossAnnualIncome),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      },
      {
        label: '年収(手取り)',
        data: result.details.map((d) => d.netAnnualIncome),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={(): void => setIsOpen(false)} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>グラフビュー</DrawerHeader>
        <DrawerBody>
          <Box position="relative" h="400px">
            <Line options={options} data={data} />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
