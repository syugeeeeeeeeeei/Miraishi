import React from 'react'
import { Button, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react'
import { useSetAtom } from 'jotai'
import { createScenarioAtom } from '@renderer/store/atoms'
import { FiTrendingUp } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'

export const WelcomeScreen = (): React.JSX.Element => {
  const createScenario = useSetAtom(createScenarioAtom)
  return (
    <Center w={'100%'} h="100%" p={8} bg="gray.50">
      <VStack spacing={6} textAlign="center">
        <Icon as={FiTrendingUp} boxSize={{ base: 16, md: 20 }} color="brand.accent" />
        <Heading as="h2" size="xl" color="brand.main">
          未来を見通すキャリアの瞳
        </Heading>
        <Text color="brand.darkGray">
          「
          <Text as="span" fontWeight={'bold'} color="brand.accent">
            Miraishi
          </Text>
          」へようこそ！
          <br />
          シナリオを作成して、あなたの収入が将来どのように変化するか予測してみましょう。
        </Text>
        <Button
          bg="brand.accent"
          color="white"
          _hover={{
            bg: 'teal.500',
            transform: 'scale(1.1)'
          }}
          leftIcon={<FaPlus />}
          onClick={createScenario}
          size="lg"
          mt={4}
          boxShadow="md"
          transition="all 0.15s ease-in-out"
        >
          シナリオを作成する
        </Button>
      </VStack>
    </Center>
  )
}
