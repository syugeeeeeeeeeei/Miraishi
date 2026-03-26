import React from 'react'
import { Heading, HStack, Image, Text } from '@chakra-ui/react'
import icon from '@renderer/assets/icon.png?asset'

export function BrandTitle(): React.JSX.Element {
  return (
    <Heading size="lg" color="brand.accent" fontFamily="M PLUS Rounded 1c" fontWeight="bold">
      <HStack>
        <Image src={icon} boxSize={8} />
        <Text>Miraishi</Text>
      </HStack>
    </Heading>
  )
}
