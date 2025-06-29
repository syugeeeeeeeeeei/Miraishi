/**
 * @file src/renderer/src/components/CalculationResult.tsx
 * @description 計算結果をChakra UIのTableで表示するコンポーネント
 */
import React from 'react'
import {
  Box,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import type { PredictionResult } from '@myTypes/miraishi'

interface Props {
  result: PredictionResult
  predictionPeriod: number
}

const formatYen = (value: number): string => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value)
}

const BreakdownPanel: React.FC<{ breakdown: PredictionResult['details'][0]['breakdown'] }> = ({
  breakdown
}) => (
  <Box p={4} bg={'gray.50'}>
    <SimpleGrid
      columns={{ base: 1, md: 2 }}
      spacing={4}
      bg="white"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold" color="green.600">
          収入の内訳
        </Text>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">基本給:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.income.annualBasicSalary)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">固定残業代:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.income.annualFixedOvertime)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">変動残業代:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.income.annualVariableOvertime)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">手当:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.income.annualAllowances)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">ボーナス:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.income.annualBonus)}
          </Text>
        </HStack>
      </VStack>
      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold" color="red.600">
          控除の内訳
        </Text>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">健康保険:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.deductions.healthInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">厚生年金:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.deductions.pensionInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">雇用保険:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.deductions.employmentInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">所得税:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.deductions.incomeTax)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">住民税:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(breakdown.deductions.residentTax)}
          </Text>
        </HStack>
      </VStack>
    </SimpleGrid>
  </Box>
)

const ResultRow = ({ detail }: { detail: PredictionResult['details'][0] }): React.JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Tr cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={onOpen}>
        <Td fontSize={{ base: 'sm', md: 'md' }} py={{ base: 2, md: 3 }}>
          {detail.year}年目
        </Td>
        <Td isNumeric fontSize={{ base: 'sm', md: 'md' }} py={{ base: 2, md: 3 }}>
          {formatYen(detail.grossAnnualIncome)}
        </Td>
        <Td isNumeric fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }} py={{ base: 2, md: 3 }}>
          {formatYen(detail.netAnnualIncome)}
        </Td>
        <Td isNumeric color="gray.600" fontSize={{ base: 'sm', md: 'md' }} py={{ base: 2, md: 3 }}>
          {formatYen(detail.netAnnualIncome / 12)}
        </Td>
      </Tr>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="brand.base">
          <ModalHeader>{detail.year}年目の詳細内訳</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4}>
            <BreakdownPanel breakdown={detail.breakdown} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export function CalculationResult({ result, predictionPeriod }: Props): React.JSX.Element {
  return (
    <VStack spacing={4} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Heading size="md" px={2}>
        計算結果{' '}
        <Tag colorScheme="blue" size="md" ml={2} verticalAlign="middle">
          {predictionPeriod}年間
        </Tag>
      </Heading>

      <TableContainer>
        <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
          <TableCaption>各行をクリックすると、その年の詳細な内訳を確認できます。</TableCaption>
          <Thead>
            <Tr>
              <Th>年度</Th>
              <Th isNumeric>年収(額面)</Th>
              <Th isNumeric>手取り年収</Th>
              <Th isNumeric>平均月収(手取り)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {result.details.map((detail) => (
              <ResultRow key={detail.year} detail={detail} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}
