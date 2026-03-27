import { describe, expect, it } from 'vitest'
import type { TaxSchemaV1 } from '@myTypes/miraishi'
import { defaultTaxSchemaV2 } from '../../shared/taxSchemaDefaults'
import { normalizeTaxSchema, parseTaxSchemaUnknown, validateTaxSchemaV2Semantics } from './validators'

describe('validators', () => {
  it('V1スキーマをV2へ移行できること', () => {
    const v1: TaxSchemaV1 = {
      version: '2025.1.0',
      incomeTaxRates: [
        { threshold: 1949000, rate: 0.05, deduction: 0 },
        { threshold: null, rate: 0.45, deduction: 4796000 }
      ],
      residentTaxRate: 0.1,
      socialInsurance: {
        healthInsurance: { rate: 0.1, maxStandardRemuneration: 1390000 },
        pension: { rate: 0.183, maxStandardRemuneration: 650000 },
        employmentInsurance: { rate: 0.005 }
      },
      deductions: {
        basic: 580000,
        spouse: 380000,
        dependent: 380000
      }
    }

    const parsed = parseTaxSchemaUnknown(v1)
    const normalized = normalizeTaxSchema(parsed)

    expect(normalized.schemaVersion).toBe('2.0')
    expect(normalized.version).toBe('2025.1.0')
    expect(normalized.rules.socialInsurance.healthInsurance.rateMode).toBe('flat')
    expect(normalized.rules.deductions.basicByTotalIncome).toEqual([{ maxTotalIncome: null, amount: 580000 }])
  })

  it('未知プロパティを拒否すること', () => {
    const schemaWithUnknown = {
      ...defaultTaxSchemaV2(),
      unknownKey: true
    }

    expect(() => parseTaxSchemaUnknown(schemaWithUnknown)).toThrow()
  })

  it('税率帯の昇順違反を検知すること', () => {
    const schema = defaultTaxSchemaV2()
    const [first, second, ...rest] = schema.rules.incomeTaxRates
    if (!first || !second) {
      throw new Error('incomeTaxRates must have at least 2 rows')
    }
    schema.rules.incomeTaxRates = [second, first, ...rest]

    const result = validateTaxSchemaV2Semantics(schema)

    expect(result.errors.some((error) => error.includes('incomeTaxRates'))).toBe(true)
  })

  it('都道府県別モードでrateByPrefectureが空ならエラーになること', () => {
    const schema = defaultTaxSchemaV2()
    schema.rules.socialInsurance.healthInsurance.rateMode = 'prefecture'
    schema.rules.socialInsurance.healthInsurance.rateByPrefecture = {}
    schema.rules.socialInsurance.healthInsurance.rate = null

    const result = validateTaxSchemaV2Semantics(schema)

    expect(
      result.errors.some((error) =>
        error.includes('healthInsurance.rateMode が prefecture の場合は rateByPrefecture が必要です。')
      )
    ).toBe(true)
  })

  it('V2でAST形式の式が混在していても文字式へ正規化されること', () => {
    const schema = defaultTaxSchemaV2()
    const step = schema.formula.steps.find((item) => item.id === 'income.annualBonus')
    if (!step) {
      throw new Error('income.annualBonus step was not found')
    }
    step.expr = { op: 'var', name: 'rawAnnualBonus' }

    const normalized = normalizeTaxSchema(schema)
    const normalizedStep = normalized.formula.steps.find((item) => item.id === 'income.annualBonus')

    expect(typeof normalizedStep?.expr).toBe('string')
    expect(normalizedStep?.expr).toBe('rawAnnualBonus')
  })
})
