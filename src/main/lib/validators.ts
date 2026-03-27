/**
 * @file src/main/lib/validators.ts
 * @description Zodを使用したバリデーションスキーマ定義
 */
import { z } from 'zod'
import type { FormulaStepId, TaxSchema, TaxSchemaV1, TaxSchemaV2 } from '@myTypes/miraishi'
import {
  DEFAULT_INDUSTRY_CODE,
  DEFAULT_PREFECTURE_CODE,
  FORMULA_STEP_IDS,
  migrateTaxSchemaV1ToV2
} from '../../shared/taxSchemaDefaults'
import { compileTaxSchemaV2 } from './taxSchemaEngine'

const durationSchema = z.union([
  z.object({ type: z.literal('unlimited') }).strict(),
  z.object({ type: z.literal('years'), value: z.number().min(0) }).strict(),
  z.object({ type: z.literal('months'), value: z.number().min(0) }).strict()
])

const allowanceSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, '手当名は必須です'),
    type: z.enum(['fixed', 'percentage']),
    amount: z.number().min(0),
    duration: durationSchema
  })
  .strict()

const fixedOvertimeSchema = z
  .object({
    enabled: z.boolean(),
    hours: z.number().min(0)
  })
  .strict()

const variableOvertimeSchema = z
  .object({
    enabled: z.boolean(),
    calculationMethod: z.string()
  })
  .strict()

const overtimeSchema = z
  .object({
    fixedOvertime: fixedOvertimeSchema,
    variableOvertime: variableOvertimeSchema
  })
  .strict()

const bonusSchema = z
  .object({
    mode: z.enum(['fixed', 'basicSalaryMonths']),
    months: z.number().min(0)
  })
  .strict()

const probationSchema = z
  .object({
    enabled: z.boolean(),
    durationMonths: z.number().int().min(0),
    basicSalary: z.number().min(0)
  })
  .strict()

const dependentsSchema = z
  .object({
    hasSpouse: z.boolean(),
    numberOfDependents: z.number().int().min(0)
  })
  .strict()

const otherDeductionSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, '控除名は必須です'),
    amount: z.number().min(0)
  })
  .strict()

const deductionsSchema = z
  .object({
    dependents: dependentsSchema,
    otherDeductions: z.array(otherDeductionSchema),
    previousYearIncome: z.number().min(0).optional().default(0)
  })
  .strict()

const taxProfileSchema = z
  .object({
    prefectureCode: z.string().min(1),
    industryCode: z.string().min(1)
  })
  .strict()

export const scenarioSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1, 'シナリオ名は必須です'),
    initialBasicSalary: z.number().min(0),
    allowances: z.array(allowanceSchema),
    overtime: overtimeSchema,
    annualBonus: z.number().min(0),
    bonus: bonusSchema.optional(),
    probation: probationSchema,
    salaryGrowthRate: z.number().min(0),
    deductions: deductionsSchema,
    taxProfile: taxProfileSchema
      .optional()
      .default({ prefectureCode: DEFAULT_PREFECTURE_CODE, industryCode: DEFAULT_INDUSTRY_CODE }),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
  })
  .strict()

export const scenariosSchema = z.array(scenarioSchema)

const incomeTaxRateSchema = z
  .object({
    threshold: z.number().nullable(),
    rate: z.number().min(0).max(1),
    deduction: z.number().min(0)
  })
  .strict()

const taxSchemaV1SchemaInternal = z
  .object({
    version: z.string().min(1),
    incomeTaxRates: z.array(incomeTaxRateSchema).min(1),
    residentTaxRate: z.number().min(0).max(1),
    socialInsurance: z
      .object({
        healthInsurance: z
          .object({
            rate: z.number().min(0).max(1),
            maxStandardRemuneration: z.number().min(0)
          })
          .strict(),
        pension: z
          .object({
            rate: z.number().min(0).max(1),
            maxStandardRemuneration: z.number().min(0)
          })
          .strict(),
        employmentInsurance: z
          .object({
            rate: z.number().min(0).max(1)
          })
          .strict()
      })
      .strict(),
    deductions: z
      .object({
        basic: z.number().min(0),
        spouse: z.number().min(0),
        dependent: z.number().min(0)
      })
      .strict()
  })
  .strict()

const formulaStepIdSchema = z.custom<FormulaStepId>(
  (value): value is FormulaStepId =>
    typeof value === 'string' && FORMULA_STEP_IDS.includes(value as FormulaStepId),
  { message: 'Unknown formula step id' }
)

const formulaExpressionSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z
      .object({
        op: z.literal('const'),
        value: z.number()
      })
      .strict(),
    z
      .object({
        op: z.literal('var'),
        name: z.string().min(1)
      })
      .strict(),
    z
      .object({
        op: z.enum(['add', 'sub', 'mul', 'div', 'min', 'max']),
        args: z.array(formulaExpressionSchema).min(1)
      })
      .strict(),
    z
      .object({
        op: z.literal('round'),
        value: formulaExpressionSchema,
        digits: z.number().int()
      })
      .strict(),
    z
      .object({
        op: z.literal('if'),
        condition: formulaExpressionSchema,
        then: formulaExpressionSchema,
        else: formulaExpressionSchema
      })
      .strict(),
    z
      .object({
        op: z.literal('clamp'),
        value: formulaExpressionSchema,
        min: formulaExpressionSchema,
        max: formulaExpressionSchema
      })
      .strict(),
    z
      .object({
        op: z.literal('bracketLookup'),
        value: formulaExpressionSchema,
        tableVar: z.string().min(1),
        thresholdKey: z.string().min(1),
        targetKey: z.string().min(1),
        defaultValue: formulaExpressionSchema.optional()
      })
      .strict(),
    z
      .object({
        op: z.literal('tableLookup'),
        key: formulaExpressionSchema,
        tableVar: z.string().min(1),
        defaultValue: formulaExpressionSchema.optional()
      })
      .strict()
  ])
)

const formulaStepSchema = z
  .object({
    id: formulaStepIdSchema,
    expr: formulaExpressionSchema
  })
  .strict()

const basicByTotalIncomeSchema = z
  .object({
    maxTotalIncome: z.number().nullable(),
    amount: z.number().min(0)
  })
  .strict()

const taxSchemaV2SchemaInternal = z
  .object({
    schemaVersion: z.literal('2.0'),
    version: z.string().min(1),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    rules: z
      .object({
        incomeTaxRates: z.array(incomeTaxRateSchema).min(1),
        reconstructionSpecialIncomeTaxRate: z.number().min(0).max(1),
        residentTaxRate: z.number().min(0).max(1),
        socialInsurance: z
          .object({
            healthInsurance: z
              .object({
                rateMode: z.enum(['flat', 'prefecture']),
                rate: z.number().min(0).max(1).nullable(),
                rateByPrefecture: z.record(z.string().min(1), z.number().min(0).max(1)),
                maxStandardRemuneration: z.number().min(0)
              })
              .strict(),
            pension: z
              .object({
                rate: z.number().min(0).max(1),
                maxStandardRemuneration: z.number().min(0)
              })
              .strict(),
            employmentInsurance: z
              .object({
                employeeRateByIndustry: z.record(z.string().min(1), z.number().min(0).max(1))
              })
              .strict()
          })
          .strict(),
        deductions: z
          .object({
            basicByTotalIncome: z.array(basicByTotalIncomeSchema).min(1),
            spouse: z.number().min(0),
            dependent: z.number().min(0)
          })
          .strict()
      })
      .strict(),
    formula: z
      .object({
        steps: z.array(formulaStepSchema).min(1)
      })
      .strict(),
    uiMeta: z
      .object({
        labels: z.record(z.string(), z.string()),
        descriptions: z.record(z.string(), z.string())
      })
      .strict()
  })
  .strict()

export const taxSchemaV1Schema = taxSchemaV1SchemaInternal
export const taxSchemaV2Schema = taxSchemaV2SchemaInternal
export const taxSchemaSchema = z.union([taxSchemaV2Schema, taxSchemaV1Schema])

export const isTaxSchemaV1 = (schema: TaxSchema): schema is TaxSchemaV1 =>
  taxSchemaV1Schema.safeParse(schema).success && !(schema as TaxSchemaV2).schemaVersion

export const isTaxSchemaV2 = (schema: TaxSchema): schema is TaxSchemaV2 =>
  taxSchemaV2Schema.safeParse(schema).success

const validateAscendingTable = (
  rows: { max: number | null }[],
  label: string,
  errors: string[]
): void => {
  let previous = -Infinity
  rows.forEach((row, index) => {
    const current = row.max ?? Infinity
    if (current < previous) {
      errors.push(`${label} の閾値は昇順である必要があります（index: ${index}）。`)
    }
    previous = current
  })
}

export const validateTaxSchemaV2Semantics = (
  schema: TaxSchemaV2
): { errors: string[]; warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []

  validateAscendingTable(
    schema.rules.incomeTaxRates.map((row) => ({ max: row.threshold })),
    'incomeTaxRates',
    errors
  )
  validateAscendingTable(
    schema.rules.deductions.basicByTotalIncome.map((row) => ({ max: row.maxTotalIncome })),
    'deductions.basicByTotalIncome',
    errors
  )

  if (
    schema.rules.socialInsurance.healthInsurance.rateMode === 'flat' &&
    schema.rules.socialInsurance.healthInsurance.rate === null
  ) {
    errors.push('healthInsurance.rateMode が flat の場合は rate が必要です。')
  }

  if (
    schema.rules.socialInsurance.healthInsurance.rateMode === 'prefecture' &&
    Object.keys(schema.rules.socialInsurance.healthInsurance.rateByPrefecture).length === 0
  ) {
    errors.push('healthInsurance.rateMode が prefecture の場合は rateByPrefecture が必要です。')
  }

  try {
    compileTaxSchemaV2(schema)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'formula コンパイルに失敗しました。')
  }

  if (schema.effectiveTo && schema.effectiveTo < schema.effectiveFrom) {
    errors.push('effectiveTo は effectiveFrom 以降の日付で指定してください。')
  }

  if (schema.rules.reconstructionSpecialIncomeTaxRate === 0) {
    warnings.push('復興特別所得税率が 0 です。制度上の意図を確認してください。')
  }

  return { errors, warnings }
}

export const normalizeTaxSchema = (schema: TaxSchema): TaxSchemaV2 => {
  if (isTaxSchemaV2(schema)) {
    return schema
  }
  return migrateTaxSchemaV1ToV2(schema)
}

export const parseTaxSchemaUnknown = (value: unknown): TaxSchema => {
  return taxSchemaSchema.parse(value) as TaxSchema
}
