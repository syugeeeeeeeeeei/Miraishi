/**
 * @file src/main/lib/calculator.ts
 * @description 給与予測計算エンジンのコアロジック (最適化版)
 */
import type {
  AnnualSalaryDetail,
  GraphViewSettings,
  PredictionResult,
  Scenario,
  TaxSchema
} from '@myTypes/miraishi'

export function calculatePrediction(
  { scenario, settings }: { scenario: Scenario; settings: GraphViewSettings },
  taxSchema: TaxSchema
): PredictionResult {
  const details: AnnualSalaryDetail[] = []
  let currentBasicSalary = scenario.initialBasicSalary
  let previousYearTaxableIncomeForResidentTax = Math.max(
    0,
    scenario.deductions?.previousYearIncome ?? 0
  )

  // --- 🔽 最適化: 事前計算 🔽 ---
  const monthlyAllowancesForOvertime = (scenario.allowances ?? []).reduce((total, allowance) => {
    if (allowance.type === 'fixed') {
      return total + allowance.amount
    }
    return total
  }, 0)

  const fixedAnnualAllowances = (scenario.allowances ?? []).reduce((total, allowance) => {
    if (allowance.type === 'fixed' && allowance.duration.type === 'unlimited') {
      return total + allowance.amount * 12
    }
    return total
  }, 0)
  // --- 🔼 最適化: 事前計算 🔼 ---

  for (let year = 1; year <= settings.predictionPeriod; year++) {
    let annualBasicSalary: number
    let annualAllowances: number
    let annualFixedOvertime: number
    let annualVariableOvertime: number
    let annualBonusCalculated: number
    let grossAnnualIncome: number
    const isProbationApplied = year === 1 && Boolean(scenario.probation?.enabled)
    const probationMonths = isProbationApplied ? (scenario.probation?.durationMonths ?? 0) : 0
    const bonusMode = scenario.bonus?.mode ?? 'fixed'
    const bonusMonths = scenario.bonus?.months ?? 2
    const fixedOvertimePremiumRate = 1.25

    // --- 🔽 最適化: 残業代計算を効率化 🔽 ---
    let monthlySalaryForOvertimeCalc: number
    if (isProbationApplied) {
      const afterProbationMonths = 12 - probationMonths
      const probSalary = (scenario.probation.basicSalary ?? 0) * probationMonths
      const afterProbSalary = (scenario.initialBasicSalary ?? 0) * afterProbationMonths
      monthlySalaryForOvertimeCalc =
        (probSalary + afterProbSalary) / 12 + monthlyAllowancesForOvertime
    } else {
      monthlySalaryForOvertimeCalc = currentBasicSalary + monthlyAllowancesForOvertime
    }

    const hourlyWage = monthlySalaryForOvertimeCalc / 160
    const fixedHours = scenario.overtime?.fixedOvertime?.enabled
      ? (scenario.overtime.fixedOvertime.hours ?? 0)
      : 0
    const overtimeHours = Math.max(0, settings.averageOvertimeHours - fixedHours)
    annualVariableOvertime = hourlyWage * fixedOvertimePremiumRate * overtimeHours * 12
    // --- 🔼 最適化: 残業代計算を効率化 🔼 ---

    if (isProbationApplied) {
      let totalBasicSalaryForYear1 = 0

      for (let month = 1; month <= 12; month++) {
        if (month <= probationMonths) {
          totalBasicSalaryForYear1 += scenario.probation.basicSalary ?? 0
        } else {
          totalBasicSalaryForYear1 += scenario.initialBasicSalary ?? 0
        }
      }
      annualBasicSalary = totalBasicSalaryForYear1
    } else {
      annualBasicSalary = currentBasicSalary * 12
    }

    // 固定残業代は「基本給連動」のみを採用
    if (fixedHours > 0) {
      if (isProbationApplied) {
        let totalFixedOvertimeForYear1 = 0
        for (let month = 1; month <= 12; month++) {
          const monthlyBasicSalaryForFixedOvertime =
            month <= probationMonths
              ? (scenario.probation.basicSalary ?? 0)
              : (scenario.initialBasicSalary ?? 0)
          const monthlyBaseForFixedOvertime =
            monthlyBasicSalaryForFixedOvertime + monthlyAllowancesForOvertime
          totalFixedOvertimeForYear1 +=
            (monthlyBaseForFixedOvertime / 160) * fixedOvertimePremiumRate * fixedHours
        }
        annualFixedOvertime = totalFixedOvertimeForYear1
      } else {
        const monthlyBaseForFixedOvertime = currentBasicSalary + monthlyAllowancesForOvertime
        annualFixedOvertime =
          (monthlyBaseForFixedOvertime / 160) * fixedOvertimePremiumRate * fixedHours * 12
      }
    } else {
      annualFixedOvertime = 0
    }

    const monthlyBasicSalaryForBonus = annualBasicSalary / 12
    annualBonusCalculated =
      bonusMode === 'basicSalaryMonths'
        ? monthlyBasicSalaryForBonus * bonusMonths
        : (scenario.annualBonus ?? 0)

    // --- 🔽 最適化: 手当計算を効率化 🔽 ---
    // 事前計算した固定手当をベースに、期間や割合が変動するものだけをループ内で計算
    annualAllowances =
      fixedAnnualAllowances +
      (scenario.allowances ?? []).reduce((total, allowance) => {
        let isAllowanceActive = false
        if (allowance.duration.type !== 'unlimited') {
          switch (allowance.duration.type) {
            case 'years':
              if (year <= allowance.duration.value) isAllowanceActive = true
              break
            case 'months':
              if (year * 12 <= allowance.duration.value) isAllowanceActive = true
              break
          }
        }

        if (isAllowanceActive && allowance.type === 'fixed') {
          return total + allowance.amount * 12
        }
        if (allowance.type === 'percentage') {
          // 割合ベースは毎年計算が必要
          return total + annualBasicSalary * (allowance.amount / 100)
        }
        return total
      }, 0)
    // --- 🔼 最適化: 手当計算を効率化 🔼 ---

    grossAnnualIncome =
      annualBasicSalary +
      annualFixedOvertime +
      annualAllowances +
      annualBonusCalculated +
      annualVariableOvertime

    // ... (以降の控除額、税金計算は変更なし) ...
    const monthlyGrossIncome = grossAnnualIncome / 12
    const standardMonthlyRemuneration = Math.min(
      Math.round(monthlyGrossIncome / 1000) * 1000,
      taxSchema.socialInsurance.healthInsurance.maxStandardRemuneration
    )

    const healthInsurance =
      standardMonthlyRemuneration * (taxSchema.socialInsurance.healthInsurance.rate / 2) * 12
    const pensionInsurance =
      Math.min(
        standardMonthlyRemuneration,
        taxSchema.socialInsurance.pension.maxStandardRemuneration
      ) *
      (taxSchema.socialInsurance.pension.rate / 2) *
      12

    const employmentInsurance =
      grossAnnualIncome * taxSchema.socialInsurance.employmentInsurance.rate
    const socialInsuranceTotal = healthInsurance + pensionInsurance + employmentInsurance

    const basicDeduction = taxSchema.deductions.basic ?? 0
    const spouseDeduction = taxSchema.deductions.spouse ?? 0
    const spouseDeductionApplied = Boolean(scenario.deductions?.dependents?.hasSpouse)
    const dependentDeductionPerPerson = taxSchema.deductions.dependent ?? 0
    const numberOfDependents = scenario.deductions?.dependents?.numberOfDependents ?? 0
    const otherDeductionsTotal = (scenario.deductions?.otherDeductions ?? []).reduce(
      (sum, d) => sum + d.amount,
      0
    )
    let totalIncomeDeductions = basicDeduction + socialInsuranceTotal
    if (spouseDeductionApplied) {
      totalIncomeDeductions += spouseDeduction
    }
    totalIncomeDeductions += numberOfDependents * dependentDeductionPerPerson
    totalIncomeDeductions += otherDeductionsTotal

    const taxableIncome = Math.max(0, grossAnnualIncome - totalIncomeDeductions)

    const incomeTaxRule =
      taxSchema.incomeTaxRates.find((r) => taxableIncome <= (r.threshold ?? Infinity)) ?? {
        threshold: null,
        rate: 0,
        deduction: 0
      }
    const incomeTax = Math.max(0, taxableIncome * incomeTaxRule.rate - incomeTaxRule.deduction)
    const residentTaxBaseIncome = previousYearTaxableIncomeForResidentTax
    const residentTaxBaseSource =
      year === 1 ? 'previousYearInput' : 'previousSimulationYearTaxableIncome'
    const residentTax = residentTaxBaseIncome * taxSchema.residentTaxRate

    const totalDeductions = socialInsuranceTotal + incomeTax + residentTax
    const netAnnualIncome = grossAnnualIncome - totalDeductions
    const growthMultiplier = 1 + (scenario.salaryGrowthRate ?? 0) / 100
    const baseSalaryForGrowth = isProbationApplied ? scenario.initialBasicSalary : currentBasicSalary
    const nextYearMonthlyBasicSalary = baseSalaryForGrowth * growthMultiplier

    details.push({
      year,
      grossAnnualIncome: Math.round(grossAnnualIncome),
      netAnnualIncome: Math.round(netAnnualIncome),
      totalDeductions: Math.round(totalDeductions),
      breakdown: {
        income: {
          annualBasicSalary: Math.round(annualBasicSalary),
          annualAllowances: Math.round(annualAllowances),
          annualBonus: Math.round(annualBonusCalculated),
          annualFixedOvertime: Math.round(annualFixedOvertime),
          annualVariableOvertime: Math.round(annualVariableOvertime)
        },
        deductions: {
          healthInsurance: Math.round(healthInsurance),
          pensionInsurance: Math.round(pensionInsurance),
          employmentInsurance: Math.round(employmentInsurance),
          incomeTax: Math.round(incomeTax),
          residentTax: Math.round(residentTax)
        }
      },
      calculationTrace: {
        rules: {
          salaryGrowthRatePercent: scenario.salaryGrowthRate ?? 0,
          bonusMode,
          bonusMonths,
          averageOvertimeHours: settings.averageOvertimeHours,
          fixedOvertimeHours: fixedHours,
          overtimePremiumRate: fixedOvertimePremiumRate,
          healthInsuranceRate: taxSchema.socialInsurance.healthInsurance.rate / 2,
          pensionInsuranceRate: taxSchema.socialInsurance.pension.rate / 2,
          employmentInsuranceRate: taxSchema.socialInsurance.employmentInsurance.rate,
          residentTaxRate: taxSchema.residentTaxRate
        },
        intermediate: {
          isProbationApplied,
          probationMonths,
          monthlyBasicSalaryForBonus,
          monthlySalaryForOvertimeCalc,
          hourlyWage,
          overtimeHours,
          monthlyGrossIncome,
          standardMonthlyRemuneration,
          socialInsuranceTotal,
          totalIncomeDeductions,
          taxableIncome,
          residentTaxBaseIncome,
          residentTaxBaseSource
        },
        deductionRules: {
          basicDeduction,
          spouseDeduction,
          spouseDeductionApplied,
          dependentDeductionPerPerson,
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
