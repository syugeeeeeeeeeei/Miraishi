/**
 * @file src/renderer/src/components/CalculationResult.tsx
 * @description 計算結果をテーブルで表示するコンポーネント
 */
import React from 'react'
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Heading, VStack } from '@chakra-ui/react'
import type { PredictionResult } from '@myTypes/miraishi'

interface Props {
  result: PredictionResult
}

export function CalculationResult({ result }: Props): React.JSX.Element {
  const formatYen = (value: number): string => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value)
  }

  return (
    <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="md" boxShadow="sm">
      <Heading size="md">計算結果 (10年間)</Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>年度</Th>
              <Th isNumeric>年収(額面)</Th>
              <Th isNumeric>手取り年収</Th>
              <Th isNumeric>控除合計</Th>
            </Tr>
          </Thead>
          <Tbody>
            {result.details.map((detail) => (
              <Tr key={detail.year}>
                <Td>{detail.year}年目</Td>
                <Td isNumeric>{formatYen(detail.grossAnnualIncome)}</Td>
                <Td isNumeric fontWeight="bold">
                  {formatYen(detail.netAnnualIncome)}
                </Td>
                <Td isNumeric>{formatYen(detail.totalDeductions)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}
