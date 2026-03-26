import React from 'react'
import { Box, Button, HStack, IconButton, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaTrash } from 'react-icons/fa'
import type { Scenario } from '@myTypes/miraishi'

const MotionButton = motion.create(Button)

interface ScenarioListProps {
  scenarios: Scenario[]
  activeScenarioIds: string[]
  searchQuery: string
  onSelectScenario: (scenarioId: string) => void
  onRequestDeleteScenario: (scenarioId: string) => void
}

export function ScenarioList({
  scenarios,
  activeScenarioIds,
  searchQuery,
  onSelectScenario,
  onRequestDeleteScenario
}: ScenarioListProps): React.JSX.Element {
  return (
    <Box flex="1" overflowY="auto" pr={2}>
      <Text fontSize="lg" fontWeight="bold" mb={4} noOfLines={1}>
        シナリオリスト
      </Text>
      {scenarios.length > 0 ? (
        scenarios.map((scenario) => {
          const isActive = activeScenarioIds.includes(scenario.id)
          return (
            <HStack key={scenario.id} w="100%" mb={2}>
              <MotionButton
                variant={isActive ? 'solid' : 'ghost'}
                colorScheme={isActive ? 'teal' : 'gray'}
                bg={isActive ? 'brand.accent' : 'transparent'}
                color={isActive ? 'white' : 'inherit'}
                flex="1"
                justifyContent="flex-start"
                onClick={(): void => onSelectScenario(scenario.id)}
                _hover={{ bg: !isActive ? 'gray.100' : 'brand.accent' }}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Text noOfLines={1}>{scenario.title}</Text>
              </MotionButton>
              <IconButton
                aria-label="Delete scenario"
                icon={<FaTrash />}
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={(): void => onRequestDeleteScenario(scenario.id)}
              />
            </HStack>
          )
        })
      ) : (
        <Text fontSize="sm" color="brand.darkGray" textAlign="center" mt={4}>
          {searchQuery ? '該当するシナリオはありません' : 'シナリオはありません'}
        </Text>
      )}
    </Box>
  )
}
