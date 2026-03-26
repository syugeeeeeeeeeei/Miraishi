import React from 'react'
import { HStack, Spacer } from '@chakra-ui/react'
import '@fontsource/m-plus-rounded-1c/japanese-700.css'
import { useAtomValue, useSetAtom } from 'jotai'
import { isGraphViewVisibleAtom, predictionResultsAtom } from '@renderer/store/atoms'
import { BrandTitle } from './BrandTitle'
import { OpenGraphButton } from './OpenGraphButton'

export function Header(): React.JSX.Element {
  const setIsGraphViewVisible = useSetAtom(isGraphViewVisibleAtom)
  const predictionResults = useAtomValue(predictionResultsAtom)

  return (
    <HStack
      w="100%"
      p={4}
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="brand.base"
      justifyContent="flex-end"
      spacing={4}
      flexShrink={0}
    >
      <BrandTitle />
      <Spacer />
      <OpenGraphButton
        isDisabled={predictionResults.length === 0}
        onOpen={(): void => setIsGraphViewVisible(true)}
      />
    </HStack>
  )
}
