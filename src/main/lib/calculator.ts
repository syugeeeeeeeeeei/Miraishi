/**
 * @file src/main/lib/calculator.ts
 * @description 給与予測計算エンジンのコアロジック (DSL対応版)
 */
import type {
  AnnualSalaryDetail,
  CompiledTaxSchemaV2,
  GraphViewSettings,
  PredictionResult,
  Scenario
} from '@myTypes/miraishi'
import { evaluateCompiledFormula } from './taxSchemaEngine'

const DAYS_PER_YEAR = 365
const LEGAL_WORKING_HOURS_PER_DAY = 8
const DEFAULT_ANNUAL_HOLIDAYS = 120

const resolveAllowanceActiveMonths = (
  duration: { type: 'unlimited' } | { type: 'years'; value: number } | { type: 'months'; value: number },
  year: number
): number => {
  if (duration.type === 'unlimited') {
    return 12
  }
  if (duration.type === 'years') {
    return year <= duration.value ? 12 : 0
  }

  const startMonth = (year - 1) * 12 + 1
  const endMonth = year * 12
  const activeEnd = Math.min(endMonth, duration.value)
  if (activeEnd < startMonth) {
    return 0
  }
  return Math.max(0, activeEnd - startMonth + 1)
}

const toRounded = (value: number): number => Math.round(Number.isFinite(value) ? value : 0)

const clampAnnualHolidays = (annualHolidays: number): number =>
  Math.min(DAYS_PER_YEAR, Math.max(0, Math.round(annualHolidays)))

const calcMonthlyStandardWorkingHours = (annualHolidays: number): number => {
  const annualWorkingDays = Math.max(1, DAYS_PER_YEAR - clampAnnualHolidays(annualHolidays))
  return (annualWorkingDays * LEGAL_WORKING_HOURS_PER_DAY) / 12
}

const deriveInitialBasicSalaryFromGross = ({
  initialGrossSalary,
  fixedOvertimeHours,
  monthlyStandardWorkingHours,
  overtimePremiumRate,
  monthlyFixedAllowancesForOvertime
}: {
  initialGrossSalary: number
  fixedOvertimeHours: number
  monthlyStandardWorkingHours: number
  overtimePremiumRate: number
  monthlyFixedAllowancesForOvertime: number
}): number => {
  if (fixedOvertimeHours <= 0) {
    return Math.max(0, initialGrossSalary)
  }

  const overtimeRatio = (overtimePremiumRate * fixedOvertimeHours) / Math.max(1, monthlyStandardWorkingHours)
  return Math.max(
    0,
    (initialGrossSalary - monthlyFixedAllowancesForOvertime * overtimeRatio) / (1 + overtimeRatio)
  )
}

export function calculatePrediction(
  { scenario, settings }: { scenario: Scenario; settings: GraphViewSettings },
  compiledTaxSchema: CompiledTaxSchemaV2
): PredictionResult {
  const schema = compiledTaxSchema.schema
  const details: AnnualSalaryDetail[] = []

  const annualHolidays = clampAnnualHolidays(scenario.annualHolidays ?? DEFAULT_ANNUAL_HOLIDAYS)
  const monthlyStandardWorkingHours = calcMonthlyStandardWorkingHours(annualHolidays)
  const fixedOvertimePremiumRate = 1.25
  const fixedHours = Math.max(0, scenario.overtime?.fixedOvertime?.hours ?? 0)

  const monthlyAllowancesForOvertime = (scenario.allowances ?? []).reduce((total, allowance) => {
    if (allowance.type === 'fixed') {
      return total + allowance.amount
    }
    return total
  }, 0)

  const initialGrossSalary = scenario.initialGrossSalary ?? scenario.initialBasicSalary ?? 0
  const initialBasicSalary = deriveInitialBasicSalaryFromGross({
    initialGrossSalary,
    fixedOvertimeHours: fixedHours,
    monthlyStandardWorkingHours,
    overtimePremiumRate: fixedOvertimePremiumRate,
    monthlyFixedAllowancesForOvertime: monthlyAllowancesForOvertime
  })

  let currentBasicSalary = initialBasicSalary
  let previousYearTaxableIncomeForResidentTax = Math.max(
    0,
    scenario.deductions?.previousYearIncome ?? 0
  )

  for (let year = 1; year <= settings.predictionPeriod; year += 1) {
    const isProbationApplied = year === 1 && Boolean(scenario.probation?.enabled)
    const probationMonths = isProbationApplied ? Math.min(12, scenario.probation?.durationMonths ?? 0) : 0
    const bonusMode = scenario.bonus?.mode ?? 'fixed'
    const bonusMonths = scenario.bonus?.months ?? 2

    let annualBasicSalary = 0
    if (isProbationApplied) {
      for (let month = 1; month <= 12; month += 1) {
        annualBasicSalary +=
          month <= probationMonths ? (scenario.probation.basicSalary ?? 0) : initialBasicSalary
      }
    } else {
      annualBasicSalary = currentBasicSalary * 12
    }

    const monthlySalaryForOvertimeCalc = isProbationApplied
      ? ((scenario.probation.basicSalary ?? 0) * probationMonths +
          initialBasicSalary * (12 - probationMonths)) /
          12 +
        monthlyAllowancesForOvertime
      : currentBasicSalary + monthlyAllowancesForOvertime

    const hourlyWage = monthlySalaryForOvertimeCalc / Math.max(1, monthlyStandardWorkingHours)

    const overtimeHours = scenario.overtime?.variableOvertime?.enabled
      ? Math.max(0, settings.averageOvertimeHours - fixedHours)
      : 0

    const rawAnnualVariableOvertime = hourlyWage * fixedOvertimePremiumRate * overtimeHours * 12

    let rawAnnualFixedOvertime = 0
    if (fixedHours > 0) {
      if (isProbationApplied) {
        for (let month = 1; month <= 12; month += 1) {
          const monthlyBasicSalaryForFixedOvertime =
            month <= probationMonths ? (scenario.probation.basicSalary ?? 0) : initialBasicSalary
          const monthlyBaseForFixedOvertime =
            monthlyBasicSalaryForFixedOvertime + monthlyAllowancesForOvertime
          rawAnnualFixedOvertime +=
            (monthlyBaseForFixedOvertime / Math.max(1, monthlyStandardWorkingHours)) *
            fixedOvertimePremiumRate *
            fixedHours
        }
      } else {
        const monthlyBaseForFixedOvertime = currentBasicSalary + monthlyAllowancesForOvertime
        rawAnnualFixedOvertime =
          (monthlyBaseForFixedOvertime / Math.max(1, monthlyStandardWorkingHours)) *
          fixedOvertimePremiumRate *
          fixedHours *
          12
      }
    }

    const rawAnnualBonus =
      bonusMode === 'basicSalaryMonths' ? (annualBasicSalary / 12) * bonusMonths : (scenario.annualBonus ?? 0)

    const rawAnnualAllowances = (scenario.allowances ?? []).reduce((total, allowance) => {
      const activeMonths = resolveAllowanceActiveMonths(allowance.duration, year)
      if (activeMonths <= 0) {
        return total
      }

      if (allowance.type === 'fixed') {
        return total + allowance.amount * activeMonths
      }

      // 割合手当も期間比率で按分して適用
      return total + annualBasicSalary * (allowance.amount / 100) * (activeMonths / 12)
    }, 0)

    const healthInsuranceRateRaw =
      schema.rules.socialInsurance.healthInsurance.rateMode === 'flat'
        ? schema.rules.socialInsurance.healthInsurance.rate ?? 0
        : schema.rules.socialInsurance.healthInsurance.rateByPrefecture[
            scenario.taxProfile?.prefectureCode ?? ''
          ] ??
          schema.rules.socialInsurance.healthInsurance.rateByPrefecture['tokyo'] ??
          0

    const healthInsuranceRateEmployee = healthInsuranceRateRaw / 2
    const pensionRateEmployee = schema.rules.socialInsurance.pension.rate / 2

    const employmentInsuranceRateEmployee =
      schema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry[
        scenario.taxProfile?.industryCode ?? ''
      ] ?? schema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.general ?? 0

    const spouseDeductionApplied = Boolean(scenario.deductions?.dependents?.hasSpouse)
    const numberOfDependents = scenario.deductions?.dependents?.numberOfDependents ?? 0
    const otherDeductionsTotal = (scenario.deductions?.otherDeductions ?? []).reduce(
      (sum, d) => sum + d.amount,
      0
    )

    const residentTaxBaseIncome = previousYearTaxableIncomeForResidentTax
    const residentTaxBaseSource =
      year === 1 ? 'previousYearInput' : 'previousSimulationYearTaxableIncome'

    const growthMultiplier = 1 + (scenario.salaryGrowthRate ?? 0) / 100
    const baseSalaryForGrowth = isProbationApplied ? initialBasicSalary : currentBasicSalary

    const runtimeVars: Record<string, unknown> = {
      rawAnnualBasicSalary: annualBasicSalary,
      rawAnnualFixedOvertime,
      rawAnnualVariableOvertime,
      rawAnnualAllowances,
      rawAnnualBonus,
      healthInsuranceMaxStandardRemuneration:
        schema.rules.socialInsurance.healthInsurance.maxStandardRemuneration,
      healthInsuranceRateEmployee,
      pensionMaxStandardRemuneration: schema.rules.socialInsurance.pension.maxStandardRemuneration,
      pensionRateEmployee,
      employmentInsuranceRateEmployee,
      totalIncomeForBasicDeduction:
        annualBasicSalary + rawAnnualAllowances + rawAnnualBonus + rawAnnualFixedOvertime + rawAnnualVariableOvertime,
      basicByTotalIncome: schema.rules.deductions.basicByTotalIncome,
      spouseDeductionAppliedFlag: spouseDeductionApplied ? 1 : 0,
      spouseDeductionAmount: schema.rules.deductions.spouse,
      numberOfDependents,
      dependentDeductionPerPerson: schema.rules.deductions.dependent,
      otherDeductionsTotal,
      incomeTaxRates: schema.rules.incomeTaxRates,
      reconstructionSpecialIncomeTaxRate: schema.rules.reconstructionSpecialIncomeTaxRate,
      residentTaxBaseIncome,
      residentTaxRate: schema.rules.residentTaxRate,
      baseSalaryForGrowth,
      salaryGrowthRatePercent: scenario.salaryGrowthRate ?? 0
    }

    const outputs = evaluateCompiledFormula(compiledTaxSchema, runtimeVars)

    const grossAnnualIncome = outputs['income.grossAnnualIncome']
    const healthInsurance = outputs['insurance.health']
    const pensionInsurance = outputs['insurance.pension']
    const employmentInsurance = outputs['insurance.employment']
    const incomeTax = outputs['taxes.income']
    const reconstructionSpecialIncomeTax = outputs['taxes.reconstruction']
    const residentTax = outputs['taxes.resident']
    const taxableIncome = outputs['taxableIncome']
    const totalDeductions = outputs['totals.totalDeductions']
    const netAnnualIncome = outputs['totals.netAnnualIncome']
    const nextYearMonthlyBasicSalary = outputs['projection.nextYearMonthlyBasicSalary']

    const monthlyGrossIncome = grossAnnualIncome / 12
    const standardMonthlyRemuneration = Math.min(
      Math.round(monthlyGrossIncome / 1000) * 1000,
      schema.rules.socialInsurance.healthInsurance.maxStandardRemuneration
    )
    const socialInsuranceTotal = healthInsurance + pensionInsurance + employmentInsurance
    const totalIncomeDeductions = Math.max(0, grossAnnualIncome - taxableIncome)

    const incomeTaxRule =
      schema.rules.incomeTaxRates.find((r) => taxableIncome <= (r.threshold ?? Infinity)) ?? {
        threshold: null,
        rate: 0,
        deduction: 0
      }

    details.push({
      year,
      grossAnnualIncome: toRounded(grossAnnualIncome),
      netAnnualIncome: toRounded(netAnnualIncome),
      totalDeductions: toRounded(totalDeductions),
      breakdown: {
        income: {
          annualBasicSalary: toRounded(outputs['income.annualBasicSalary']),
          annualAllowances: toRounded(outputs['income.annualAllowances']),
          annualBonus: toRounded(outputs['income.annualBonus']),
          annualFixedOvertime: toRounded(outputs['income.annualFixedOvertime']),
          annualVariableOvertime: toRounded(outputs['income.annualVariableOvertime'])
        },
        deductions: {
          healthInsurance: toRounded(healthInsurance),
          pensionInsurance: toRounded(pensionInsurance),
          employmentInsurance: toRounded(employmentInsurance),
          incomeTax: toRounded(incomeTax),
          reconstructionSpecialIncomeTax: toRounded(reconstructionSpecialIncomeTax),
          residentTax: toRounded(residentTax)
        }
      },
      calculationTrace: {
        rules: {
          salaryGrowthRatePercent: scenario.salaryGrowthRate ?? 0,
          annualHolidays,
          bonusMode,
          bonusMonths,
          averageOvertimeHours: settings.averageOvertimeHours,
          fixedOvertimeHours: fixedHours,
          overtimePremiumRate: fixedOvertimePremiumRate,
          healthInsuranceRate: healthInsuranceRateEmployee,
          pensionInsuranceRate: pensionRateEmployee,
          employmentInsuranceRate: employmentInsuranceRateEmployee,
          residentTaxRate: schema.rules.residentTaxRate,
          reconstructionSpecialIncomeTaxRate: schema.rules.reconstructionSpecialIncomeTaxRate
        },
        intermediate: {
          isProbationApplied,
          probationMonths,
          monthlyBasicSalaryForBonus: annualBasicSalary / 12,
          monthlySalaryForOvertimeCalc,
          monthlyStandardWorkingHours,
          hourlyWage,
          overtimeHours,
          monthlyGrossIncome,
          standardMonthlyRemuneration,
          socialInsuranceTotal,
          totalIncomeDeductions,
          taxableIncome,
          totalIncomeForBasicDeduction: grossAnnualIncome,
          residentTaxBaseIncome,
          residentTaxBaseSource
        },
        deductionRules: {
          basicDeduction: outputs['deductions.basic'],
          spouseDeduction: schema.rules.deductions.spouse,
          spouseDeductionApplied,
          dependentDeductionPerPerson: schema.rules.deductions.dependent,
          numberOfDependents,
          otherDeductionsTotal
        },
        incomeTaxRule: {
          bracketUpper: incomeTaxRule.threshold,
          rate: incomeTaxRule.rate,
          deduction: incomeTaxRule.deduction
        },
        nextYearProjection: {
          baseSalaryForGrowth,
          growthMultiplier,
          nextYearMonthlyBasicSalary
        }
      }
    })

    previousYearTaxableIncomeForResidentTax = taxableIncome
    currentBasicSalary = nextYearMonthlyBasicSalary
  }

  return { details }
}
