import { Button, Heading, HStack, Image, Spacer, Text } from '@chakra-ui/react'
import { FaChartLine } from 'react-icons/fa'
import React from 'react'
import icon from '@renderer/assets/icon.png?asset' // icon をインポート
import '@fontsource/m-plus-rounded-1c/700.css'
import { useAtomValue, useSetAtom } from 'jotai/index'
import { isGraphViewVisibleAtom, predictionResultsAtom } from '@renderer/store/atoms' // フォントをインポート

export function Header(): React.JSX.Element {
  const setIsGraphViewVisible = useSetAtom(isGraphViewVisibleAtom) // GraphView表示状態を制御するsetter
  const predictionResults = useAtomValue(predictionResultsAtom) // 予測結果を取得
  return (
    <HStack
      w={'100%'}
      p={4}
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="brand.base"
      justifyContent="flex-end"
      spacing={4}
      flexShrink={0} // ヘッダーが縮まないように固定
    >
      <Heading size="lg" color="brand.accent" fontFamily={'M PLUS Rounded 1c'} fontWeight="bold">
        <HStack>
          <Image src={icon} boxSize={8} />
          <Text>Miraishi</Text>
        </HStack>
      </Heading>
      <Spacer />
      <Button
        leftIcon={<FaChartLine />}
        colorScheme="purple"
        onClick={(): void => setIsGraphViewVisible(true)}
        size="sm"
        isDisabled={predictionResults.length === 0} // 予測結果がない場合はボタンを無効化
      >
        グラフ表示
      </Button>
    </HStack>
  )
}
