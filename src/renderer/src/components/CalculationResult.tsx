/**
 * @file src/renderer/src/components/CalculationResult.tsx
 * @description 計算結果をテーブルで表示するコンポーネント（react-window + Modal対応版）
 */
import React, { memo } from 'react'
import {
  Box,
  Heading,
  VStack,
  SimpleGrid,
  Text,
  HStack,
  Tag,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { FixedSizeList } from 'react-window'
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
  <Box p={4}>
    <SimpleGrid
      columns={2}
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

// 1. 名前付き関数としてコンポーネントを定義
const RowComponent = ({
  data,
  index,
  style
}: {
  data: PredictionResult['details']
  index: number
  style: React.CSSProperties
}): React.JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const detail = data[index]

  return (
    <Box style={style}>
      <HStack
        w="100%"
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.200"
        cursor="pointer"
        _hover={{ bg: 'gray.100' }}
        onClick={onOpen}
        transition="background-color 0.2s"
      >
        <Box flex="1">
          <Text>{detail.year}年目</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text>{formatYen(detail.grossAnnualIncome)}</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text fontWeight="bold">{formatYen(detail.netAnnualIncome)}</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text color="gray.600">{formatYen(detail.netAnnualIncome / 12)}</Text>
        </Box>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{detail.year}年目の詳細内訳</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4}>
            <BreakdownPanel breakdown={detail.breakdown} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
// 2. 名前付き関数にdisplayNameを設定
RowComponent.displayName = 'RowComponent'

// 3. memoでラップする
const Row = memo(RowComponent)

export function CalculationResult({ result, predictionPeriod }: Props): React.JSX.Element {
  return (
    <VStack spacing={2} align="stretch" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Heading size="md" px={2}>
        計算結果{' '}
        <Tag colorScheme="blue" size="md" ml={2}>
          {predictionPeriod}年間
        </Tag>
      </Heading>

      <HStack w="100%" px={4} py={2} borderBottomWidth="2px" borderColor="gray.300">
        <Box flex="1">
          <Text fontWeight="bold">年度</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text fontWeight="bold">年収(額面)</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text fontWeight="bold">手取り年収</Text>
        </Box>
        <Box flex="2" textAlign="right">
          <Text fontWeight="bold">平均月収(手取り)</Text>
        </Box>
      </HStack>

      <Box h="400px" w="100%">
        <FixedSizeList
          height={400}
          itemCount={result.details.length}
          itemSize={57} // 行の高さを固定 (py(3*4=12)*2 + text-size)
          width="100%"
          itemData={result.details}
        >
          {Row}
        </FixedSizeList>
      </Box>
    </VStack>
  )
}
