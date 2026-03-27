import { describe, it, expect } from 'vitest'
import { calculatePrediction } from './calculator'
import type { GraphViewSettings, Scenario, TaxSchemaV2 } from '@myTypes/miraishi'
import { compileTaxSchemaV2 } from './taxSchemaEngine'
import { defaultTaxSchemaV2 } from '../../shared/taxSchemaDefaults'

// テスト用のダミー税制スキーマ
const dummyTaxSchemaV2: TaxSchemaV2 = (() => {
  const schema = defaultTaxSchemaV2()
  schema.version = '2026.test'
  schema.rules.socialInsurance.healthInsurance.rateMode = 'flat'
  schema.rules.socialInsurance.healthInsurance.rate = 0.1
  schema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.general = 0.0055
  schema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.agricultureForestrySakeManufacturing =
    0.0055
  schema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.construction = 0.0055
  schema.rules.deductions.basicByTotalIncome = [{ maxTotalIncome: null, amount: 480000 }]
  return schema
})()

const compiledDummyTaxSchema = compileTaxSchemaV2(dummyTaxSchemaV2)

// テスト用の基本設定
const defaultSettings: GraphViewSettings = {
  predictionPeriod: 3,
  averageOvertimeHours: 0,
  displayItem: ['netAnnual']
}

// テスト用の基本シナリオ
const baseScenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt' | 'title'> = {
  initialGrossSalary: 300000,
  initialBasicSalary: 300000,
  annualHolidays: 120,
  annualBonus: 600000,
  salaryGrowthRate: 2,
  allowances: [],
  overtime: {
    fixedOvertime: { enabled: false, hours: 0 },
    variableOvertime: { enabled: false, calculationMethod: 'basic' }
  },
  probation: { enabled: false, durationMonths: 0, basicSalary: 0 },
  deductions: {
    dependents: { hasSpouse: false, numberOfDependents: 0 },
    otherDeductions: [],
    previousYearIncome: 0
  },
  taxProfile: {
    prefectureCode: 'tokyo',
    industryCode: 'general'
  }
}

describe('calculatePrediction', () => {
  it('基本的なシナリオで正しく給与が計算されること', () => {
    const scenario = {
      ...baseScenario,
      id: '1',
      title: 'test',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    // 1年目の額面年収 = 基本給30万 * 12ヶ月 + ボーナス60万 = 4,200,000円
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4200000, 0)

    // 2年目の基本給 = 300,000 * 1.02 = 306,000
    // 2年目の額面年収 = 306,000 * 12 + 600,000 = 4,272,000
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4272000, 0)

    // 3年目の基本給 = 306,000 * 1.02 = 312,120
    // 3年目の額面年収 = 312,120 * 12 + 600,000 = 4,345,440
    expect(result.details[2].grossAnnualIncome).toBeCloseTo(4345440, 0)
  })

  it('ボーナスを基本給連動（ヶ月）モードで計算できること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: 'bonus-months-test',
      title: 'bonus-months-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      annualBonus: 0,
      bonus: {
        mode: 'basicSalaryMonths',
        months: 2
      }
    }

    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    // 1年目: 基本給360万 + ボーナス(30万×2)60万 = 420万
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4200000, 0)

    // 2年目: 基本給367.2万 + ボーナス(30.6万×2)61.2万 = 428.4万
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4284000, 0)

    // 3年目: 基本給374.544万 + ボーナス(31.212万×2)62.424万 = 436.968万
    expect(result.details[2].grossAnnualIncome).toBeCloseTo(4369680, 0)
  })

  it('試用期間が正しく反映されること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '2',
      title: 'probation-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      probation: { enabled: true, durationMonths: 3, basicSalary: 250000 }
    }
    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    // 1年目の基本給 = (25万 * 3ヶ月) + (30万 * 9ヶ月) = 75万 + 270万 = 345万
    // 1年目の額面年収 = 345万 + ボーナス60万 = 405万
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4050000, 0)

    // 2年目以降は、試用期間終了後の基本給(30万)から成長率が適用される
    // 2年目の基本給 = 300,000 * 1.02 = 306,000
    // 2年目の額面年収 = 306,000 * 12 + 600,000 = 4,272,000
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4272000, 0)
  })

  it('各種手当が正しく加算されること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '3',
      title: 'allowance-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      allowances: [
        // 固定手当（無期限）
        {
          id: 'a1',
          name: '住宅手当',
          type: 'fixed',
          amount: 20000,
          duration: { type: 'unlimited' }
        },
        // 固定手当（2年で終了）
        {
          id: 'a2',
          name: '資格手当',
          type: 'fixed',
          amount: 10000,
          duration: { type: 'years', value: 2 }
        },
        // 割合手当
        {
          id: 'a3',
          name: '役職手当',
          type: 'percentage',
          amount: 5,
          duration: { type: 'unlimited' }
        }
      ]
    }
    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    // 1年目:
    // 基本給 = 360万
    // 手当 = (住宅手当2万 + 資格手当1万) * 12 + (基本給360万 * 5%) = 36万 + 18万 = 54万
    // ボーナス = 60万
    // 合計 = 360 + 54 + 60 = 474万
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4740000, 0)

    // 2年目:
    // 基本給 = 30万 * 1.02 * 12 = 367.2万
    // 手当 = (住宅手当2万 + 資格手当1万) * 12 + (基本給367.2万 * 5%) = 36万 + 18.36万 = 54.36万
    // ボーナス = 60万
    // 合計 = 367.2 + 54.36 + 60 = 481.56万
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4815600, 0)

    // 3年目 (資格手当がなくなる):
    // 基本給 = 30万 * 1.02 * 1.02 * 12 = 374.544万
    // 手当 = (住宅手当2万) * 12 + (基本給374.544万 * 5%) = 24万 + 18.7272万 = 42.7272万
    // ボーナス = 60万
    // 合計 = 374.544 + 42.7272 + 60 = 477.2712万
    expect(result.details[2].grossAnnualIncome).toBeCloseTo(4772712, 0)
  })

  it('給与成長率100%で基本給が毎年倍増すること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '4',
      title: 'growth-100-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      annualBonus: 0,
      salaryGrowthRate: 100
    }

    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    expect(result.details[0].breakdown.income.annualBasicSalary).toBeCloseTo(3600000, 0)
    expect(result.details[1].breakdown.income.annualBasicSalary).toBeCloseTo(7200000, 0)
    expect(result.details[2].breakdown.income.annualBasicSalary).toBeCloseTo(14400000, 0)
  })

  it('固定残業代が基本給連動で毎年増加すること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '5',
      title: 'fixed-overtime-linked-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      overtime: {
        fixedOvertime: { enabled: true, hours: 20 },
        variableOvertime: { enabled: false, calculationMethod: 'basic' }
      }
    }

    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)

    // 初任給は固定残業代込みで入力し、年間休日から算出した所定労働時間で固定残業代を分解する
    expect(result.details[0].breakdown.income.annualFixedOvertime).toBeCloseTo(477876, 0)
    expect(result.details[1].breakdown.income.annualFixedOvertime).toBeCloseTo(487434, 0)
    expect(result.details[2].breakdown.income.annualFixedOvertime).toBeCloseTo(497182, 0)
  })

  it('住民税が前年ベースで計算され、1年目は前年度収入入力値が使われること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '6',
      title: 'resident-tax-lag-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      annualBonus: 0,
      salaryGrowthRate: 0,
      deductions: {
        ...baseScenario.deductions,
        previousYearIncome: 1500000
      }
    }

    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)
    const year1 = result.details[0]
    const year2 = result.details[1]

    // 1年目の住民税は入力した前年度収入を基準に計算
    expect(year1.breakdown.deductions.residentTax).toBeCloseTo(150000, 0)
    expect(year1.calculationTrace.intermediate.residentTaxBaseIncome).toBeCloseTo(1500000, 0)
    expect(year1.calculationTrace.intermediate.residentTaxBaseSource).toBe('previousYearInput')

    // 2年目の住民税は1年目の課税所得を基準に計算
    expect(year2.calculationTrace.intermediate.residentTaxBaseIncome).toBeCloseTo(
      year1.calculationTrace.intermediate.taxableIncome,
      0
    )
    expect(year2.calculationTrace.intermediate.residentTaxBaseSource).toBe(
      'previousSimulationYearTaxableIncome'
    )
  })

  it('前年度収入が0の場合、1年目の住民税が0になること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '7',
      title: 'new-graduate-resident-tax-test',
      createdAt: new Date(),
      updatedAt: new Date(),
      annualBonus: 0,
      salaryGrowthRate: 0,
      deductions: {
        ...baseScenario.deductions,
        previousYearIncome: 0
      }
    }

    const result = calculatePrediction({ scenario, settings: defaultSettings }, compiledDummyTaxSchema)
    const year1 = result.details[0]

    expect(year1.breakdown.deductions.residentTax).toBe(0)
    expect(year1.calculationTrace.intermediate.residentTaxBaseIncome).toBe(0)
    expect(year1.calculationTrace.intermediate.residentTaxBaseSource).toBe('previousYearInput')
  })
})
