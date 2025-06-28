import {
  VStack,
  Text,
  Flex,
  IconButton,
  Button,
  ButtonProps,
  Box,
  HStack,
  Separator,
  Input,
  Spinner,
  Alert,
  Icon
} from '@chakra-ui/react'
import { RxPencil2, RxHamburgerMenu, RxCross2 } from 'react-icons/rx'
import { GoGear, GoSearch } from 'react-icons/go'
import React, { useState, useRef, useEffect } from 'react'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { Scenario } from '@myTypes/scenario'
import { FiMoreVertical } from 'react-icons/fi'
import { useAtom, useAtomValue } from 'jotai'
import { isControlPanelOpenAtom } from '@renderer/atoms/uiAtoms'
import { uuidv4 } from 'zod/v4'
import { activeScenarioAtom, savedScenariosAtom } from '@renderer/atoms/scenarioAtoms'

type ScenarioListProps = {
  scenariosLoadable: Loadable<Scenario[]>
  activeScenario: Scenario | null
  onScenarioSelect: (scenario: Scenario) => void
}

const ScenarioList = ({
  scenariosLoadable,
  activeScenario,
  onScenarioSelect
}: ScenarioListProps): React.JSX.Element => {
  switch (scenariosLoadable.state) {
    case 'loading':
      return <Spinner />
    case 'hasError':
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Failed to load scenarios.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )
    case 'hasData':
      return (
        <VStack gap={1} align="stretch" w="100%">
          {scenariosLoadable.data.map((scenario) => (
            <HStack
              key={scenario.id}
              p={2}
              borderRadius="md"
              bg={activeScenario?.id === scenario.id ? 'teal.600' : 'transparent'}
              color={activeScenario?.id === scenario.id ? 'white' : 'inherit'}
              _hover={{
                bg: activeScenario?.id !== scenario.id ? 'whiteAlpha.200' : 'teal.700'
              }}
              cursor="pointer"
              onClick={() => onScenarioSelect(scenario)}
              userSelect="none"
            >
              <Text flex={1} fontSize="sm" fontWeight="medium">
                {scenario.name}
              </Text>
              <IconButton
                aria-label="Scenario options"
                variant="ghost"
                size="sm"
                rounded={'lg'}
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implement menu (rename, delete, export)
                  console.log('Menu clicked for', scenario.name)
                }}
              >
                <Icon as={FiMoreVertical} />
              </IconButton>
            </HStack>
          ))}
        </VStack>
      )
  }
  return <></>
}

interface ControlPanelProps {
  panelToggle: () => void // パネルの開閉を切り替えるための関数
  panelOpen: () => void // パネルを開くための関数
  panelClose: () => void // パネルを閉じるための
  isExpanded: boolean // パネルが展開されているかどうかの状態
  width: number // 現在のパネルの幅
}

interface ExpandingTextButtonProps extends ButtonProps {
  isExpanded: boolean
  icon?: React.JSX.Element
}

const ExpandingButton: React.FC<ExpandingTextButtonProps> = ({
  isExpanded,
  children,
  icon,
  ...props
}) => {
  return (
    <Button
      bg={props.bg} // 画像から色を取得し設定
      color="white"
      height="44px" // ボタンの高さを固定
      width={isExpanded ? '100%' : '44px'} // isExpandedに応じて幅を変更（例として200pxを設定）
      overflow="hidden" // テキストがはみ出るのを防ぐ
      {...props}
      px={0}
      rounded={'3xl'}
      transition="all 0.2s ease-in-out"
      _hover={{
        bg: 'app.accent.dark',
        boxShadow: 'none',
        cursor: 'pointer' // カーソルをポインターに変更
      }}
    >
      <HStack w={'100%'} justifyContent={'flex-start'}>
        <IconButton bg={'inherit'} size={'lg'}>
          {icon}
        </IconButton>
        {isExpanded && (
          <Box as="span" ml={3} textWrap={'nowrap'}>
            {children}
          </Box>
        )}
      </HStack>
    </Button>
  )
}

export const ControlPanel = (): React.JSX.Element => {
  const [isOpen, setIsOpen] = useAtom(isControlPanelOpenAtom)
  const [isSearchFocused, setSearchFocused] = useState(false)

  const savedScenariosLoadable = useAtomValue(savedScenariosAtom)
  const [activeScenario, setActiveScenario] = useAtom(activeScenarioAtom)

  const handleNewScenario = (): void => {
    const newScenario: Scenario = {
      id: uuidv4(),
      name: 'Untitled Scenario',
      salaryDetails: {
        baseSalary: 3000000,
        allowances: [],
        overtimeHours: 0,
        performanceBonus: 0
      },
      deductions: {
        healthInsurance: 0,
        pension: 0,
        employmentInsurance: 0,
        incomeTax: 0,
        residentTax: 0
      },
      settings: {
        promotionRate: 1.03,
        calculationMode: 'simple'
      }
    }
    setActiveScenario(newScenario)
    if (!isOpen) {
      setIsOpen.on()
    }
  }

  return (
    <Box
      as="aside"
      w={isOpen ? '280px' : '60px'}
      bg="gray.800"
      color="white"
      p={3}
      transition="width 0.2s"
      display="flex"
      flexDirection="column"
      h="100vh"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <IconButton
            aria-label="Toggle menu"
            icon={<Icon as={FiMenu} />}
            onClick={setIsOpen.toggle}
            variant="ghost"
            _hover={{ bg: 'whiteAlpha.300' }}
          />
          <Collapse in={isOpen} unmountOnExit>
            <Text fontSize="lg" fontWeight="bold">
              Miraishi
            </Text>
          </Collapse>
        </HStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search"
            bg="gray.700"
            border="none"
            focusBorderColor="teal.500"
            onFocus={setSearchFocused.on}
            onBlur={setSearchFocused.off}
            style={{
              width: isOpen || isSearchFocused ? '100%' : '38px',
              transition: 'width 0.2s',
              paddingLeft: '2.5rem'
            }}
          />
        </InputGroup>

        <Collapse in={isOpen} unmountOnExit>
          <VStack spacing={4} align="stretch">
            <Button
              leftIcon={<Icon as={FiPlus} />}
              bg="teal.500"
              _hover={{ bg: 'teal.600' }}
              onClick={handleNewScenario}
            >
              New Scenario
            </Button>
            <Box>
              <HStack
                cursor="pointer"
                userSelect="none"
                p={2}
                borderRadius="md"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <Text fontWeight="bold" flex={1}>
                  Scenarios
                </Text>
                <Icon as={FiChevronDown} />
              </HStack>
              <Box mt={2} pl={2}>
                <ScenarioList
                  scenariosLoadable={savedScenariosLoadable}
                  activeScenario={activeScenario}
                  onScenarioSelect={setActiveScenario}
                />
              </Box>
            </Box>
            <Box>
              <HStack
                cursor="pointer"
                userSelect="none"
                p={2}
                borderRadius="md"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <Text fontWeight="bold" flex={1}>
                  Settings
                </Text>
                <Icon as={FiChevronUp} />
              </HStack>
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
}
