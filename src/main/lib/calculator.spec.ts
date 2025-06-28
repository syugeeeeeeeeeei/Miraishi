/**
 * @file src/main/lib/calculator.spec.ts
 * @description calculator.ts のユニットテスト
 */
import { describe, it, expect } from 'vitest'
import { calculatePrediction } from './calculator'
import type { Scenario, TaxSchema } from '@myTypes/miraishi' // ◀◀◀ パスエイリアス使用

// テスト用の現実的な税制スキーマ
const realisticTaxSchema: TaxSchema = {
  version: 'test-2024-realistic',
  incomeTaxRates: [
    { threshold: 1950000, rate: 0.05, deduction: 0 },
    { threshold: 3300000, rate: 0.1, deduction: 97500 },
    { threshold: 6950000, rate: 0.2, deduction: 427500 },
    { threshold: 9000000, rate: 0.23, deduction: 636000 },
    { threshold: 18000000, rate: 0.33, deduction: 1536000 },
    { threshold: 40000000, rate: 0.4, deduction: 2796000 },
    { threshold: null, rate: 0.45, deduction: 4796000 }
  ],
  residentTaxRate: 0.1,
  socialInsurance: {
    healthInsurance: { rate: 0.1, maxStandardRemuneration: 1390000 },
    pension: { rate: 0.183, maxStandardRemuneration: 650000 },
    employmentInsurance: { rate: 0.006 }
  }
}

// テスト用の基本的なシナリオ
const baseScenario: Scenario = {
  id: 'test-uuid-1',
  title: '基本テストシナリオ',
  initialBasicSalary: 300000, // 月給30万 -> 年収360万
  allowances: [],
  overtime: {
    fixedOvertime: { enabled: false, amount: 0, hours: 0 },
    variableOvertime: { enabled: false, calculationMethod: '' }
  },
  salaryGrowthRate: 0,
  deductions: {
    dependents: { hasSpouse: false, numberOfDependents: 0 },
    otherDeductions: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('calculatePrediction with realistic logic', () => {
  it('基本的なシナリオで1年間の手取り額を正しく計算できること', () => {
    const result = calculatePrediction(baseScenario, realisticTaxSchema, 1)
    const year1 = result.details[0]

    expect(year1.year).toBe(1)
    expect(year1.grossAnnualIncome).toBe(3600000)

    // 各控除額と手取り額が妥当な範囲にあるかを確認 (厳密な値は複雑なため、大まかな検証)
    expect(year1.healthInsurance).toBeGreaterThan(100000)
    expect(year1.pensionInsurance).toBeGreaterThan(100000)
    expect(year1.employmentInsurance).toBeGreaterThan(10000)
    expect(year1.incomeTax).toBeGreaterThan(50000)
    expect(year1.residentTax).toBeGreaterThan(100000)

    const calculatedNet = year1.grossAnnualIncome - year1.totalDeductions
    expect(year1.netAnnualIncome).toBe(calculatedNet)
    // 一般的な手取り額の範囲に収まっているか
    expect(year1.netAnnualIncome).toBeGreaterThan(2500000)
    expect(year1.netAnnualIncome).toBeLessThan(3000000)
  })

  // 🔽 ----- ここからテストケースを追加 ----- 🔽
  it('扶養控除とその他控除が適用されると、手取り額が増えること', () => {
    const scenarioWithDeductions: Scenario = {
      ...baseScenario,
      deductions: {
        dependents: { hasSpouse: true, numberOfDependents: 1 }, // 配偶者控除 + 扶養控除1人
        otherDeductions: [{ id: 'ideco', name: 'iDeCo', amount: 276000 }] // 年間27.6万円の控除
      }
    }

    const resultWithoutDeductions = calculatePrediction(baseScenario, realisticTaxSchema, 1)
    const resultWithDeductions = calculatePrediction(scenarioWithDeductions, realisticTaxSchema, 1)

    const netIncomeWithoutDeductions = resultWithoutDeductions.details[0].netAnnualIncome
    const netIncomeWithDeductions = resultWithDeductions.details[0].netAnnualIncome

    // 控除が増えたので、税金が減り、手取り額は増えるはず
    expect(netIncomeWithDeductions).toBeGreaterThan(netIncomeWithoutDeductions)

    // 所得税と住民税が減っていることを確認
    expect(resultWithDeductions.details[0].incomeTax).toBeLessThan(
      resultWithoutDeductions.details[0].incomeTax
    )
    expect(resultWithDeductions.details[0].residentTax).toBeLessThan(
      resultWithoutDeductions.details[0].residentTax
    )
  })

  it('期間設定された手当が、指定年数後に計算から除外されること', () => {
    const scenarioWithTimedAllowance: Scenario = {
      ...baseScenario,
      allowances: [
        {
          id: 'timed-allowance',
          name: '住宅手当',
          type: 'fixed',
          amount: 20000, // 月2万円
          duration: { type: 'years', value: 2 } // 2年間のみ支給
        }
      ]
    }

    const result = calculatePrediction(scenarioWithTimedAllowance, realisticTaxSchema, 3)

    const year2GrossIncome = result.details[1].grossAnnualIncome // 2年目
    const year3GrossIncome = result.details[2].grossAnnualIncome // 3年目

    // 2年目は手当(年間24万円)が加算されているはず
    expect(year2GrossIncome).toBe(3600000 + 240000)
    // 3年目は手当の期間が切れているので、基本給のみのはず
    expect(year3GrossIncome).toBe(3600000)
  })
  // 🔼 ----- ここまでテストケースを追加 ----- 🔼
})
