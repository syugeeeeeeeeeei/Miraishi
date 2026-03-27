/**
 * @file src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx
 * @description 計算結果をChakra UIのTableで表示するコンポーネント
 */
import React from 'react'
import {
  Box,
  Code,
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

type DetailRow = PredictionResult['details'][0]

const formatYen = (value: number): string => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value)
}

const formatNumber = (value: number, maximumFractionDigits = 2): string => {
  return new Intl.NumberFormat('ja-JP', { maximumFractionDigits }).format(value)
}

const formatRateFromRatio = (ratio: number): string => {
  return `${formatNumber(ratio * 100, 2)}%`
}

const FormulaLine = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <Code
    display="block"
    whiteSpace="normal"
    bg="gray.50"
    color="gray.800"
    px={3}
    py={2}
    borderRadius="md"
    fontSize="sm"
    fontFamily="body"
    lineHeight="tall"
  >
    {children}
  </Code>
)

const SectionCard = ({
  title,
  rule,
  children
}: {
  title: string
  rule: string
  children: React.ReactNode
}): React.JSX.Element => (
  <VStack
    align="stretch"
    spacing={2}
    bg="white"
    p={4}
    borderRadius="md"
    borderWidth="1px"
    borderColor="gray.200"
  >
    <Text fontWeight="bold">{title}</Text>
    <Text fontSize="sm" color="gray.600">
      {rule}
    </Text>
    <VStack align="stretch" spacing={2}>
      {children}
    </VStack>
  </VStack>
)

const CalculationFlowPanel = ({ detail }: { detail: DetailRow }): React.JSX.Element => {
  const { breakdown, grossAnnualIncome, netAnnualIncome, totalDeductions, calculationTrace } = detail

  const socialInsuranceTotal =
    breakdown.deductions.healthInsurance +
    breakdown.deductions.pensionInsurance +
    breakdown.deductions.employmentInsurance
  const monthlyNetIncome = netAnnualIncome / 12
  const dependentDeductionTotal =
    calculationTrace.deductionRules.numberOfDependents *
    calculationTrace.deductionRules.dependentDeductionPerPerson
  const isBonusLinkedToBasic = calculationTrace.rules.bonusMode === 'basicSalaryMonths'
  const spouseDeductionAppliedAmount = calculationTrace.deductionRules.spouseDeductionApplied
    ? calculationTrace.deductionRules.spouseDeduction
    : 0
  const incomeTaxBracketLabel =
    calculationTrace.incomeTaxRule.bracketUpper === null
      ? '上限なし'
      : formatYen(calculationTrace.incomeTaxRule.bracketUpper)
  const residentTaxBaseSourceLabel =
    calculationTrace.intermediate.residentTaxBaseSource === 'previousYearInput'
      ? '入力した前年度収入'
      : '前年度の課税所得（シミュレーション結果）'

  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="sm">計算フロー（ルールと実計算式）</Heading>

      <SectionCard
        title="1. 変動残業代の算出"
        rule="時給ベースで、平均残業時間から固定残業時間を差し引いた対象時間のみを計上します。"
      >
        <FormulaLine>{`時給 = 残業計算用月給 ÷ 160 = ${formatYen(calculationTrace.intermediate.monthlySalaryForOvertimeCalc)} ÷ 160 = ${formatYen(calculationTrace.intermediate.hourlyWage)}`}</FormulaLine>
        <FormulaLine>{`対象残業時間 = max(0, 平均残業時間 - 固定残業時間) = max(0, ${formatNumber(calculationTrace.rules.averageOvertimeHours)}h - ${formatNumber(calculationTrace.rules.fixedOvertimeHours)}h) = ${formatNumber(calculationTrace.intermediate.overtimeHours)}h`}</FormulaLine>
        <FormulaLine>{`年間変動残業代 = 時給 × ${formatNumber(calculationTrace.rules.overtimePremiumRate, 2)} × 対象残業時間 × 12 = ${formatYen(breakdown.income.annualVariableOvertime)}`}</FormulaLine>
      </SectionCard>

      <SectionCard
        title="2. 額面年収の算出"
        rule={`収入項目を合算して年間の額面年収を計算します。${
          calculationTrace.intermediate.isProbationApplied
            ? `（この年は試用期間 ${calculationTrace.intermediate.probationMonths} ヶ月を反映）`
            : ''
        } 固定残業代は基本給連動で算出し、ボーナスは${isBonusLinkedToBasic ? '基本給連動モード' : '固定額モード'}です。`}
      >
        {calculationTrace.rules.fixedOvertimeHours > 0 ? (
          <FormulaLine>{`年間固定残業代 = （残業計算用月給 ÷ 160）× ${formatNumber(calculationTrace.rules.overtimePremiumRate, 2)} × ${formatNumber(calculationTrace.rules.fixedOvertimeHours)}h × 12 = ${formatYen(breakdown.income.annualFixedOvertime)}`}</FormulaLine>
        ) : (
          <FormulaLine>{`年間固定残業代 = 0（固定残業時間: ${formatNumber(calculationTrace.rules.fixedOvertimeHours)}h）`}</FormulaLine>
        )}
        {isBonusLinkedToBasic ? (
          <FormulaLine>{`ボーナス = 月額基本給 × 支給月数 = ${formatYen(calculationTrace.intermediate.monthlyBasicSalaryForBonus)} × ${formatNumber(calculationTrace.rules.bonusMonths, 2)} = ${formatYen(breakdown.income.annualBonus)}`}</FormulaLine>
        ) : (
          <FormulaLine>{`ボーナス = 固定額 = ${formatYen(breakdown.income.annualBonus)}`}</FormulaLine>
        )}
        <FormulaLine>{`額面年収 = 基本給 + 固定残業代 + 変動残業代 + 手当 + ボーナス`}</FormulaLine>
        <FormulaLine>{`= ${formatYen(breakdown.income.annualBasicSalary)} + ${formatYen(breakdown.income.annualFixedOvertime)} + ${formatYen(breakdown.income.annualVariableOvertime)} + ${formatYen(breakdown.income.annualAllowances)} + ${formatYen(breakdown.income.annualBonus)} = ${formatYen(grossAnnualIncome)}`}</FormulaLine>
      </SectionCard>

      <SectionCard
        title="3. 社会保険料の算出"
        rule="標準報酬月額と各保険料率（本人負担分）から年間社会保険料を計算します。"
      >
        <FormulaLine>{`標準報酬月額 = ${formatYen(calculationTrace.intermediate.standardMonthlyRemuneration)}（月額総支給: ${formatYen(calculationTrace.intermediate.monthlyGrossIncome)}）`}</FormulaLine>
        <FormulaLine>{`健康保険 = 標準報酬月額 × ${formatRateFromRatio(calculationTrace.rules.healthInsuranceRate)} × 12 = ${formatYen(breakdown.deductions.healthInsurance)}`}</FormulaLine>
        <FormulaLine>{`厚生年金 = 標準報酬月額 × ${formatRateFromRatio(calculationTrace.rules.pensionInsuranceRate)} × 12 = ${formatYen(breakdown.deductions.pensionInsurance)}`}</FormulaLine>
        <FormulaLine>{`雇用保険 = 額面年収 × ${formatRateFromRatio(calculationTrace.rules.employmentInsuranceRate)} = ${formatYen(breakdown.deductions.employmentInsurance)}`}</FormulaLine>
        <FormulaLine>{`社会保険料合計 = ${formatYen(breakdown.deductions.healthInsurance)} + ${formatYen(breakdown.deductions.pensionInsurance)} + ${formatYen(breakdown.deductions.employmentInsurance)} = ${formatYen(socialInsuranceTotal)}`}</FormulaLine>
      </SectionCard>

      <SectionCard
        title="4. 課税所得・税額の算出"
        rule="控除を差し引いて課税所得を求めます。住民税は前年ベース（1年目は前年度収入入力値）で計算します。"
      >
        <FormulaLine>{`所得控除合計 = 基礎控除 + 配偶者控除 + 扶養控除 + その他控除 + 社会保険料`}</FormulaLine>
        <FormulaLine>{`= ${formatYen(calculationTrace.deductionRules.basicDeduction)} + ${formatYen(spouseDeductionAppliedAmount)} + ${formatYen(dependentDeductionTotal)} + ${formatYen(calculationTrace.deductionRules.otherDeductionsTotal)} + ${formatYen(socialInsuranceTotal)} = ${formatYen(calculationTrace.intermediate.totalIncomeDeductions)}`}</FormulaLine>
        <FormulaLine>{`課税所得 = max(0, 額面年収 - 所得控除合計) = max(0, ${formatYen(grossAnnualIncome)} - ${formatYen(calculationTrace.intermediate.totalIncomeDeductions)}) = ${formatYen(calculationTrace.intermediate.taxableIncome)}`}</FormulaLine>
        <FormulaLine>{`所得税（税率帯: ${incomeTaxBracketLabel}）= max(0, 課税所得 × ${formatRateFromRatio(calculationTrace.incomeTaxRule.rate)} - ${formatYen(calculationTrace.incomeTaxRule.deduction)}) = ${formatYen(breakdown.deductions.incomeTax)}`}</FormulaLine>
        <FormulaLine>{`復興特別所得税 = 所得税 × ${formatRateFromRatio(calculationTrace.rules.reconstructionSpecialIncomeTaxRate)} = ${formatYen(breakdown.deductions.incomeTax)} × ${formatRateFromRatio(calculationTrace.rules.reconstructionSpecialIncomeTaxRate)} = ${formatYen(breakdown.deductions.reconstructionSpecialIncomeTax)}`}</FormulaLine>
        <FormulaLine>{`住民税 = 住民税計算ベース × ${formatRateFromRatio(calculationTrace.rules.residentTaxRate)} = ${formatYen(calculationTrace.intermediate.residentTaxBaseIncome)} × ${formatRateFromRatio(calculationTrace.rules.residentTaxRate)} = ${formatYen(breakdown.deductions.residentTax)}（基準: ${residentTaxBaseSourceLabel}）`}</FormulaLine>
      </SectionCard>

      <SectionCard
        title="5. 手取り年収の算出"
        rule="社会保険料と税額の合計を差し引いて、手取り年収を算出します。"
      >
        <FormulaLine>{`控除合計 = 社会保険料合計 + 所得税 + 復興特別所得税 + 住民税 = ${formatYen(socialInsuranceTotal)} + ${formatYen(breakdown.deductions.incomeTax)} + ${formatYen(breakdown.deductions.reconstructionSpecialIncomeTax)} + ${formatYen(breakdown.deductions.residentTax)} = ${formatYen(totalDeductions)}`}</FormulaLine>
        <FormulaLine>{`手取り年収 = 額面年収 - 控除合計 = ${formatYen(grossAnnualIncome)} - ${formatYen(totalDeductions)} = ${formatYen(netAnnualIncome)}`}</FormulaLine>
        <FormulaLine>{`平均月収（手取り）= 手取り年収 ÷ 12 = ${formatYen(netAnnualIncome)} ÷ 12 = ${formatYen(monthlyNetIncome)}`}</FormulaLine>
      </SectionCard>

      <SectionCard
        title="6. 翌年基本給への反映ルール"
        rule="翌年の基本給は、基準基本給に給与成長率を乗じて更新します。"
      >
        <FormulaLine>{`翌年基本給 = 基準基本給 × (1 + 成長率 ÷ 100)`}</FormulaLine>
        <FormulaLine>{`= ${formatYen(calculationTrace.nextYearProjection.baseSalaryForGrowth)} × (1 + ${formatNumber(calculationTrace.rules.salaryGrowthRatePercent, 2)} ÷ 100) = ${formatYen(calculationTrace.nextYearProjection.nextYearMonthlyBasicSalary)}（月額）`}</FormulaLine>
        <FormulaLine>{`成長係数 = 1 + 成長率 ÷ 100 = ${formatNumber(calculationTrace.nextYearProjection.growthMultiplier, 4)}`}</FormulaLine>
      </SectionCard>

      <Box bg="white" p={4} borderRadius="md" borderWidth="1px" borderColor="gray.200">
        <Text fontSize="xs" color="gray.600">
          ※ 税率・控除額は税制スキーマを参照し、内部では端数を含めて計算した後に表示時に四捨五入しています。
        </Text>
      </Box>
    </VStack>
  )
}

const BreakdownPanel: React.FC<{ detail: DetailRow }> = ({ detail }) => (
  <VStack align="stretch" spacing={4} p={4} bg="gray.50">
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
            {formatYen(detail.breakdown.income.annualBasicSalary)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">固定残業代:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.income.annualFixedOvertime)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">変動残業代:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.income.annualVariableOvertime)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">手当:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.income.annualAllowances)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">ボーナス:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.income.annualBonus)}
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
            {formatYen(detail.breakdown.deductions.healthInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">厚生年金:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.deductions.pensionInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">雇用保険:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.deductions.employmentInsurance)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">所得税:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.deductions.incomeTax)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">復興特別所得税:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.deductions.reconstructionSpecialIncomeTax)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">住民税:</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatYen(detail.breakdown.deductions.residentTax)}
          </Text>
        </HStack>
      </VStack>
    </SimpleGrid>

    <CalculationFlowPanel detail={detail} />
  </VStack>
)

const ResultRow = ({ detail }: { detail: DetailRow }): React.JSX.Element => {
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

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
        <ModalOverlay />
        <ModalContent bg="brand.base" maxH="90vh">
          <ModalHeader>{detail.year}年目の詳細内訳</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4} overflowY="auto">
            <BreakdownPanel detail={detail} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export function PredictionResultTable({ result, predictionPeriod }: Props): React.JSX.Element {
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
