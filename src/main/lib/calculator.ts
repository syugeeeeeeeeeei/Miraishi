/**
 * @file src/main/lib/calculator.ts
 * @description 給与予測計算エンジンのコアロジック
 */
import type { Scenario, TaxSchema, PredictionResult, AnnualSalaryDetail } from '@myTypes/miraishi'

export function calculatePrediction(
  scenario: Scenario,
  taxSchema: TaxSchema,
  predictionYears: number
): PredictionResult {
  const details: AnnualSalaryDetail[] = []
  let currentBasicSalary = scenario.initialBasicSalary

  for (let year = 1; year <= predictionYears; year++) {
    const annualBasicSalary = currentBasicSalary * 12
    const annualAllowances = scenario.allowances.reduce((total, allowance) => {
      if (allowance.type === 'fixed') {
        return total + allowance.amount * 12
      } else {
        return total + annualBasicSalary * allowance.amount
      }
    }, 0)

    const grossAnnualIncome = annualBasicSalary + annualAllowances

    // --- 社会保険料の計算 ---
    const standardMonthlyRemuneration = Math.min(
      Math.round(grossAnnualIncome / 12 / 1000) * 1000,
      taxSchema.socialInsurance.healthInsurance.maxStandardRemuneration
    )

    // 🔽 ----- ここから修正 (料率を2で割る) ----- 🔽
    const healthInsurance =
      standardMonthlyRemuneration * (taxSchema.socialInsurance.healthInsurance.rate / 2) * 12
    const pensionInsurance =
      Math.min(
        standardMonthlyRemuneration,
        taxSchema.socialInsurance.pension.maxStandardRemuneration
      ) *
      (taxSchema.socialInsurance.pension.rate / 2) *
      12
    // 🔼 ----- ここまで修正 ----- 🔼

    const employmentInsurance =
      grossAnnualIncome * taxSchema.socialInsurance.employmentInsurance.rate
    const socialInsuranceTotal = healthInsurance + pensionInsurance + employmentInsurance

    const taxableIncome = Math.max(0, grossAnnualIncome - socialInsuranceTotal - 480000)

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
      healthInsurance: Math.round(healthInsurance),
      pensionInsurance: Math.round(pensionInsurance),
      employmentInsurance: Math.round(employmentInsurance),
      incomeTax: Math.round(incomeTax),
      residentTax: Math.round(residentTax)
    })

    currentBasicSalary *= 1 + scenario.salaryGrowthRate / 100
  }

  return { details }
}
