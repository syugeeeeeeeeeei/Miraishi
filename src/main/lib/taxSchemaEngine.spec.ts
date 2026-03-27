import { describe, expect, it } from 'vitest'
import { defaultTaxSchemaV2 } from '../../shared/taxSchemaDefaults'
import { compileTaxSchemaV2, evaluateCompiledFormula, parseFormulaExpression } from './taxSchemaEngine'

const buildRuntimeVars = (): Record<string, unknown> => ({
  rawAnnualBasicSalary: 3600000,
  rawAnnualFixedOvertime: 300000,
  rawAnnualVariableOvertime: 120000,
  rawAnnualAllowances: 240000,
  rawAnnualBonus: 600000,
  healthInsuranceMaxStandardRemuneration: 1390000,
  healthInsuranceRateEmployee: 0.05,
  pensionMaxStandardRemuneration: 650000,
  pensionRateEmployee: 0.0915,
  employmentInsuranceRateEmployee: 0.005,
  totalIncomeForBasicDeduction: 4860000,
  basicByTotalIncome: [{ maxTotalIncome: null, amount: 580000 }],
  spouseDeductionAppliedFlag: 1,
  spouseDeductionAmount: 380000,
  numberOfDependents: 1,
  dependentDeductionPerPerson: 380000,
  otherDeductionsTotal: 120000,
  incomeTaxRates: [
    { threshold: 1949000, rate: 0.05, deduction: 0 },
    { threshold: 3299000, rate: 0.1, deduction: 97500 },
    { threshold: 6949000, rate: 0.2, deduction: 427500 },
    { threshold: null, rate: 0.45, deduction: 4796000 }
  ],
  reconstructionSpecialIncomeTaxRate: 0.021,
  residentTaxBaseIncome: 3000000,
  residentTaxRate: 0.1,
  baseSalaryForGrowth: 300000,
  salaryGrowthRatePercent: 2.5
})

describe('taxSchemaEngine', () => {
  it('defaultTaxSchemaV2 をコンパイルできること', () => {
    const schema = defaultTaxSchemaV2()
    expect(() => compileTaxSchemaV2(schema)).not.toThrow()
  })

  it('必須step不足を拒否すること', () => {
    const schema = defaultTaxSchemaV2()
    schema.formula.steps = schema.formula.steps.filter((step) => step.id !== 'taxableIncome')

    expect(() => compileTaxSchemaV2(schema)).toThrow(/不足している step id: taxableIncome/)
  })

  it('未定義変数参照を拒否すること', () => {
    const schema = defaultTaxSchemaV2()
    const target = schema.formula.steps.find((step) => step.id === 'income.annualBonus')
    if (!target) {
      throw new Error('income.annualBonus step was not found')
    }
    target.expr = 'unknownVariable'

    expect(() => compileTaxSchemaV2(schema)).toThrow(/未定義変数 unknownVariable/)
  })

  it('循環依存を拒否すること', () => {
    const schema = defaultTaxSchemaV2()
    const target = schema.formula.steps.find((step) => step.id === 'income.annualBasicSalary')
    if (!target) {
      throw new Error('income.annualBasicSalary step was not found')
    }
    target.expr = 'totals.netAnnualIncome'

    expect(() => compileTaxSchemaV2(schema)).toThrow(/循環依存/)
  })

  it('危険な関数呼び出しを拒否すること', () => {
    const schema = defaultTaxSchemaV2()
    const target = schema.formula.steps.find((step) => step.id === 'income.annualBonus')
    if (!target) {
      throw new Error('income.annualBonus step was not found')
    }
    target.expr = 'process.exit(1)'

    expect(() => compileTaxSchemaV2(schema)).toThrow(/未許可関数/)
  })

  it('危険なキー参照を拒否すること', () => {
    const schema = defaultTaxSchemaV2()
    const target = schema.formula.steps.find((step) => step.id === 'deductions.basic')
    if (!target) {
      throw new Error('deductions.basic step was not found')
    }
    target.expr = "bracketLookup(income.grossAnnualIncome, '__proto__', 'maxTotalIncome', 'amount', 0)"

    expect(() => compileTaxSchemaV2(schema)).toThrow(/不正/)
  })

  it('式長の上限を超える場合に拒否すること', () => {
    const longExpression = `x${'+x'.repeat(5000)}`
    expect(() => parseFormulaExpression(longExpression, 'income.annualBonus')).toThrow(/長すぎます/)
  })

  it('同一入力で決定的に評価されること', () => {
    const compiled = compileTaxSchemaV2(defaultTaxSchemaV2())

    const result1 = evaluateCompiledFormula(compiled, buildRuntimeVars())
    const result2 = evaluateCompiledFormula(compiled, buildRuntimeVars())

    expect(result1).toEqual(result2)
    expect(result1['totals.netAnnualIncome']).toBeTypeOf('number')
  })
})
