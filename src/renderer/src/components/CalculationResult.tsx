/**
 * @file src/renderer/src/components/CalculationResult.tsx
 * @description 計算結果をテーブルで表示するコンポーネント
 */
import React, { useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  VStack,
  Icon,
  SimpleGrid,
  Text,
  HStack,
  Tag,
  Collapse
} from '@chakra-ui/react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
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
  <SimpleGrid columns={2} spacing={4} p={4} bg="gray.50" borderRadius="md">
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
)

const ExpandableRow: React.FC<{ detail: PredictionResult['details'][0] }> = ({ detail }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = (): void => setIsOpen(!isOpen)

  return (
    <>
      <Tr onClick={handleToggle} cursor="pointer" _hover={{ bg: 'gray.100' }}>
        <Td>{detail.year}年目</Td>
        <Td isNumeric>{formatYen(detail.grossAnnualIncome)}</Td>
        <Td isNumeric fontWeight="bold">
          {formatYen(detail.netAnnualIncome)}
        </Td>
        <Td isNumeric color="gray.600">
          {formatYen(detail.netAnnualIncome / 12)}
        </Td>
        <Td pl={8}>
          <Icon as={isOpen ? FaChevronUp : FaChevronDown} />
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={5} p={0} border="none">
          <Collapse in={isOpen} animateOpacity>
            <BreakdownPanel breakdown={detail.breakdown} />
          </Collapse>
        </Td>
      </Tr>
    </>
  )
}

export function CalculationResult({ result, predictionPeriod }: Props): React.JSX.Element {
  return (
    <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
      <Heading size="md">
        計算結果{' '}
        <Tag colorScheme="blue" size="md" ml={2}>
          {predictionPeriod}年間
        </Tag>
      </Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>年度</Th>
              <Th isNumeric>年収(額面)</Th>
              <Th isNumeric>手取り年収</Th>
              <Th isNumeric>平均月収(手取り)</Th>
              <Th pl={8}>詳細</Th>
            </Tr>
          </Thead>
          <Tbody>
            {result.details.map((detail) => (
              <ExpandableRow key={detail.year} detail={detail} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}
