import { useMemo } from 'react'
import type { Scenario } from '../../../types/scenario' // ★ パス修正
import type { SalaryDetails, DeductionDetails } from '../../../types/tax' // ★ パス修正

// --- 簡易計算ロジックのための仮定値 ---
// 注: 実際の値は、国税庁や保険組合の最新情報をご確認ください。
const HEALTH_INSURANCE_RATE = 0.1 // 健康保険料率 (40歳未満・東京・協会けんぽと仮定)
const PENSION_RATE = 0.183 // 厚生年金保険料率
const EMPLOYMENT_INSURANCE_RATE = 0.0155 // 雇用保険料率 (一般の事業と仮定)
const BASIC_DEDUCTION = 480000 // 基礎控除 (合計所得2400万円以下)
// const SOCIAL_INSURANCE_DEDUCTION_MAX = 10000000; // 社会保険料控除の上限（実際には給与による）

/**
 * 年収から所得税を簡易計算する関数（令和5年分 所得税の速算表を参考）
 * @param yearlyGross - 年間額面給与
 * @param socialInsuranceTotal - 社会保険料合計
 * @returns 所得税額
 */
function calculateIncomeTax(yearlyGross: number, socialInsuranceTotal: number): number {
  const taxableIncome = yearlyGross - socialInsuranceTotal - BASIC_DEDUCTION
  if (taxableIncome <= 0) return 0

  // 令和5年分 所得税の速算表に基づく簡易計算
  if (taxableIncome <= 1949000) return taxableIncome * 0.05
  if (taxableIncome <= 3299000) return taxableIncome * 0.1 - 97500
  if (taxableIncome <= 6949000) return taxableIncome * 0.2 - 427500
  if (taxableIncome <= 8999000) return taxableIncome * 0.23 - 636000
  if (taxableIncome <= 17999000) return taxableIncome * 0.33 - 1536000
  if (taxableIncome <= 39999000) return taxableIncome * 0.4 - 2796000
  return taxableIncome * 0.45 - 4796000
}

/**
 * シナリオ情報を受け取り、給与詳細（手取り、控除など）を計算するカスタムフック
 * @param scenario - 計算対象のシナリオ
 * @returns 計算された給与詳細、または未計算状態のnull
 */
export function useTaxCalculator(scenario: Scenario | null): SalaryDetails | null {
  return useMemo(() => {
    if (!scenario || scenario.baseSalary <= 0) {
      return null
    }

    const yearlyGross = scenario.baseSalary * 12 // ボーナスは考慮しない簡易計算

    // 1. 社会保険料の計算
    // 標準報酬月額を考慮した簡易計算
    const standardMonthlySalary = Math.min(Math.max(scenario.baseSalary, 58000), 1390000)
    const yearlyHealthInsurance = ((standardMonthlySalary * HEALTH_INSURANCE_RATE) / 2) * 12 // 労使折半
    const yearlyPension = ((standardMonthlySalary * PENSION_RATE) / 2) * 12 // 労使折半
    const yearlyEmploymentInsurance = yearlyGross * EMPLOYMENT_INSURANCE_RATE * (6.0 / 15.5) // 労働者負担分

    const socialInsuranceTotal = yearlyHealthInsurance + yearlyPension + yearlyEmploymentInsurance

    // 2. 所得税の計算
    const yearlyIncomeTax = calculateIncomeTax(yearlyGross, socialInsuranceTotal)

    // 3. 住民税の計算 (簡易的に（課税所得 - 調整控除）の10%とする)
    const taxableIncomeForResident = Math.max(
      0,
      yearlyGross - socialInsuranceTotal - BASIC_DEDUCTION
    )
    const yearlyResidentTax = Math.max(0, taxableIncomeForResident * 0.1 - 2500)

    // 4. 合計と手取りの計算
    const yearlyDeductions: DeductionDetails = {
      healthInsurance: Math.round(yearlyHealthInsurance),
      pension: Math.round(yearlyPension),
      employmentInsurance: Math.round(yearlyEmploymentInsurance),
      incomeTax: Math.round(yearlyIncomeTax),
      residentTax: Math.round(yearlyResidentTax),
      total: Math.round(socialInsuranceTotal + yearlyIncomeTax + yearlyResidentTax)
    }

    const yearlyNet = yearlyGross - yearlyDeductions.total

    const salaryDetails: SalaryDetails = {
      year: 0, // 0年目（現在）のデータ
      yearlyGross: Math.round(yearlyGross),
      monthlyGross: scenario.baseSalary,
      yearlyNet: Math.round(yearlyNet),
      monthlyNet: Math.round(yearlyNet / 12),
      yearlyDeductions
    }

    return salaryDetails
  }, [scenario])
}
