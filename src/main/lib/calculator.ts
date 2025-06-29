/**
 * @file src/main/lib/calculator.ts
 * @description 給与予測計算エンジンのコアロジック
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

  for (let year = 1; year <= settings.predictionPeriod; year++) {
    let annualBasicSalary: number
    let annualAllowances: number
    let annualFixedOvertime: number
    let annualVariableOvertime: number
    let grossAnnualIncome: number

    const monthlyAllowancesForOvertime = (scenario.allowances ?? []).reduce((total, allowance) => {
      if (allowance.type === 'fixed') {
        return total + allowance.amount
      }
      return total
    }, 0)

    let monthlySalaryForOvertimeCalc: number
    if (year === 1 && scenario.probation?.enabled) {
      const probationMonths = scenario.probation.durationMonths
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
    annualVariableOvertime = hourlyWage * 1.25 * overtimeHours * 12

    if (year === 1 && scenario.probation?.enabled) {
      let totalBasicSalaryForYear1 = 0
      let totalFixedOvertimeForYear1 = 0
      const probationMonths = scenario.probation.durationMonths

      for (let month = 1; month <= 12; month++) {
        if (month <= probationMonths) {
          totalBasicSalaryForYear1 += scenario.probation.basicSalary ?? 0
          totalFixedOvertimeForYear1 += scenario.probation.fixedOvertime ?? 0
        } else {
          totalBasicSalaryForYear1 += scenario.initialBasicSalary ?? 0
          if (scenario.overtime?.fixedOvertime?.enabled) {
            totalFixedOvertimeForYear1 += scenario.overtime.fixedOvertime.amount ?? 0
          }
        }
      }

      annualBasicSalary = totalBasicSalaryForYear1
      annualFixedOvertime = totalFixedOvertimeForYear1

      annualAllowances = (scenario.allowances ?? []).reduce((total, allowance) => {
        if (allowance.type === 'fixed') {
          return total + allowance.amount * 12
        } else {
          return total + scenario.initialBasicSalary * 12 * (allowance.amount / 100)
        }
      }, 0)

      grossAnnualIncome =
        annualBasicSalary +
        annualFixedOvertime +
        annualAllowances +
        (scenario.annualBonus ?? 0) +
        annualVariableOvertime
    } else {
      annualBasicSalary = currentBasicSalary * 12
      annualFixedOvertime = scenario.overtime?.fixedOvertime?.enabled
        ? (scenario.overtime.fixedOvertime.amount ?? 0) * 12
        : 0

      annualAllowances = (scenario.allowances ?? []).reduce((total, allowance) => {
        let isAllowanceActive = false
        switch (allowance.duration.type) {
          case 'unlimited':
            isAllowanceActive = true
            break
          case 'years':
            if (year <= allowance.duration.value) {
              isAllowanceActive = true
            }
            break
          case 'months':
            if (year * 12 <= allowance.duration.value) {
              isAllowanceActive = true
            }
            break
        }

        if (isAllowanceActive) {
          if (allowance.type === 'fixed') {
            return total + allowance.amount * 12
          } else {
            return total + annualBasicSalary * (allowance.amount / 100)
          }
        }
        return total
      }, 0)

      grossAnnualIncome =
        annualBasicSalary +
        annualFixedOvertime +
        annualAllowances +
        (scenario.annualBonus ?? 0) +
        annualVariableOvertime
    }

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

    let totalIncomeDeductions = (taxSchema.deductions.basic ?? 0) + socialInsuranceTotal
    if (scenario.deductions?.dependents?.hasSpouse) {
      totalIncomeDeductions += taxSchema.deductions.spouse ?? 0
    }
    totalIncomeDeductions +=
      (scenario.deductions?.dependents?.numberOfDependents ?? 0) *
      (taxSchema.deductions.dependent ?? 0)
    const otherDeductionsTotal = (scenario.deductions?.otherDeductions ?? []).reduce(
      (sum, d) => sum + d.amount,
      0
    )
    totalIncomeDeductions += otherDeductionsTotal

    const taxableIncome = Math.max(0, grossAnnualIncome - totalIncomeDeductions)

    const incomeTaxRate = taxSchema.incomeTaxRates.find(
      (r) => taxableIncome <= (r.threshold ?? Infinity)
    )
    const incomeTax = incomeTaxRate
      ? Math.max(0, taxableIncome * incomeTaxRate.rate - incomeTaxRate.deduction)
      : 0
    const residentTax = taxableIncome * taxSchema.residentTaxRate

    const totalDeductions = socialInsuranceTotal + incomeTax + residentTax
    const netAnnualIncome = grossAnnualIncome - totalDeductions

    details.push({
      year,
      grossAnnualIncome: Math.round(grossAnnualIncome),
      netAnnualIncome: Math.round(netAnnualIncome),
      totalDeductions: Math.round(totalDeductions),
      breakdown: {
        income: {
          annualBasicSalary: Math.round(annualBasicSalary),
          annualAllowances: Math.round(annualAllowances),
          annualBonus: Math.round(scenario.annualBonus ?? 0),
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
      }
    })

    const baseSalaryForGrowth =
      year === 1 && scenario.probation?.enabled ? scenario.initialBasicSalary : currentBasicSalary
    currentBasicSalary = baseSalaryForGrowth * (1 + (scenario.salaryGrowthRate ?? 0) / 100)
  }

  return { details }
}
