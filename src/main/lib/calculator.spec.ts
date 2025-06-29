import { describe, it, expect } from 'vitest'
import { calculatePrediction } from './calculator'
import type { Scenario, TaxSchema, GraphViewSettings } from '@myTypes/miraishi'

// テスト用のダミー税制スキーマ
const dummyTaxSchema: TaxSchema = {
  version: '2025.1.0',
  incomeTaxRates: [
    { threshold: 1949000, rate: 0.05, deduction: 0 },
    { threshold: 3299000, rate: 0.1, deduction: 97500 },
    { threshold: 6949000, rate: 0.2, deduction: 427500 },
    { threshold: 8999000, rate: 0.23, deduction: 636000 },
    { threshold: 17999000, rate: 0.33, deduction: 1536000 },
    { threshold: 39999000, rate: 0.4, deduction: 2796000 },
    { threshold: null, rate: 0.45, deduction: 4796000 }
  ],
  residentTaxRate: 0.1,
  socialInsurance: {
    healthInsurance: { rate: 0.1, maxStandardRemuneration: 1390000 },
    pension: { rate: 0.183, maxStandardRemuneration: 650000 },
    employmentInsurance: { rate: 0.0055 }
  },
  deductions: {
    basic: 480000, // 簡略化のため基礎控除のみ考慮
    spouse: 380000,
    dependent: 380000,
  }
};

// テスト用の基本設定
const defaultSettings: GraphViewSettings = {
  predictionPeriod: 3,
  averageOvertimeHours: 0,
  displayItem: ['netAnnual']
};

// テスト用の基本シナリオ
const baseScenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt' | 'title'> = {
  initialBasicSalary: 300000,
  annualBonus: 600000,
  salaryGrowthRate: 2,
  allowances: [],
  overtime: {
    fixedOvertime: { enabled: false, amount: 0, hours: 0 },
    variableOvertime: { enabled: false, calculationMethod: 'basic' }
  },
  probation: { enabled: false, durationMonths: 0, basicSalary: 0, fixedOvertime: 0 },
  deductions: {
    dependents: { hasSpouse: false, numberOfDependents: 0 },
    otherDeductions: []
  }
};

describe('calculatePrediction', () => {

  it('基本的なシナリオで正しく給与が計算されること', () => {
    const scenario = { ...baseScenario, id: '1', title: 'test', createdAt: new Date(), updatedAt: new Date() };
    const result = calculatePrediction({ scenario, settings: defaultSettings }, dummyTaxSchema);

    // 1年目の額面年収 = 基本給30万 * 12ヶ月 + ボーナス60万 = 4,200,000円
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4200000, 0);

    // 2年目の基本給 = 300,000 * 1.02 = 306,000
    // 2年目の額面年収 = 306,000 * 12 + 600,000 = 4,272,000
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4272000, 0);

    // 3年目の基本給 = 306,000 * 1.02 = 312,120
    // 3年目の額面年収 = 312,120 * 12 + 600,000 = 4,345,440
    expect(result.details[2].grossAnnualIncome).toBeCloseTo(4345440, 0);
  });

  it('試用期間が正しく反映されること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '2', title: 'probation-test', createdAt: new Date(), updatedAt: new Date(),
      probation: { enabled: true, durationMonths: 3, basicSalary: 250000, fixedOvertime: 0 }
    };
    const result = calculatePrediction({ scenario, settings: defaultSettings }, dummyTaxSchema);

    // 1年目の基本給 = (25万 * 3ヶ月) + (30万 * 9ヶ月) = 75万 + 270万 = 345万
    // 1年目の額面年収 = 345万 + ボーナス60万 = 405万
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4050000, 0);

    // 2年目以降は、試用期間終了後の基本給(30万)から成長率が適用される
    // 2年目の基本給 = 300,000 * 1.02 = 306,000
    // 2年目の額面年収 = 306,000 * 12 + 600,000 = 4,272,000
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4272000, 0);
  });

  it('各種手当が正しく加算されること', () => {
    const scenario: Scenario = {
      ...baseScenario,
      id: '3', title: 'allowance-test', createdAt: new Date(), updatedAt: new Date(),
      allowances: [
        // 固定手当（無期限）
        { id: 'a1', name: '住宅手当', type: 'fixed', amount: 20000, duration: { type: 'unlimited' } },
        // 固定手当（2年で終了）
        { id: 'a2', name: '資格手当', type: 'fixed', amount: 10000, duration: { type: 'years', value: 2 } },
        // 割合手当
        { id: 'a3', name: '役職手当', type: 'percentage', amount: 5, duration: { type: 'unlimited' } }
      ]
    };
    const result = calculatePrediction({ scenario, settings: defaultSettings }, dummyTaxSchema);

    // 1年目:
    // 基本給 = 360万
    // 手当 = (住宅手当2万 + 資格手当1万) * 12 + (基本給360万 * 5%) = 36万 + 18万 = 54万
    // ボーナス = 60万
    // 合計 = 360 + 54 + 60 = 474万
    expect(result.details[0].grossAnnualIncome).toBeCloseTo(4740000, 0);

    // 2年目:
    // 基本給 = 30万 * 1.02 * 12 = 367.2万
    // 手当 = (住宅手当2万 + 資格手当1万) * 12 + (基本給367.2万 * 5%) = 36万 + 18.36万 = 54.36万
    // ボーナス = 60万
    // 合計 = 367.2 + 54.36 + 60 = 481.56万
    expect(result.details[1].grossAnnualIncome).toBeCloseTo(4815600, 0);

    // 3年目 (資格手当がなくなる):
    // 基本給 = 30万 * 1.02 * 1.02 * 12 = 374.544万
    // 手当 = (住宅手当2万) * 12 + (基本給374.544万 * 5%) = 24万 + 18.7272万 = 42.7272万
    // ボーナス = 60万
    // 合計 = 374.544 + 42.7272 + 60 = 477.2712万
    expect(result.details[2].grossAnnualIncome).toBeCloseTo(4772712, 0);
  });
});
