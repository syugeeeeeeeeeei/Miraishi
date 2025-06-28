/**
 * @file src/lib/validators.ts
 * @description Zodを使用したバリデーションスキーマ定義
 */
import { z } from 'zod'

// Duration
const durationSchema = z.union([
  z.object({ type: z.literal('unlimited') }),
  z.object({ type: z.literal('years'), value: z.number().min(0) }),
  z.object({ type: z.literal('months'), value: z.number().min(0) })
])

// Allowance
const allowanceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '手当名は必須です'),
  type: z.enum(['fixed', 'percentage']),
  amount: z.number().min(0),
  duration: durationSchema
})

// Overtime
const fixedOvertimeSchema = z.object({
  enabled: z.boolean(),
  amount: z.number().min(0),
  hours: z.number().min(0)
})

const variableOvertimeSchema = z.object({
  enabled: z.boolean(),
  calculationMethod: z.string() // 将来的な拡張用
})

const overtimeSchema = z.object({
  fixedOvertime: fixedOvertimeSchema,
  variableOvertime: variableOvertimeSchema
})

// 🔽 ----- ここから追加 ----- 🔽
// Probation
const probationSchema = z.object({
  enabled: z.boolean(),
  durationMonths: z.number().int().min(0),
  basicSalary: z.number().min(0),
  fixedOvertime: z.number().min(0)
})
// 🔼 ----- ここまで追加 ----- 🔼

// Deductions
const dependentsSchema = z.object({
  hasSpouse: z.boolean(),
  numberOfDependents: z.number().int().min(0)
})

const otherDeductionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '控除名は必須です'),
  amount: z.number().min(0)
})

const deductionsSchema = z.object({
  dependents: dependentsSchema,
  otherDeductions: z.array(otherDeductionSchema)
})

// Scenario
export const scenarioSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'シナリオ名は必須です'),
  initialBasicSalary: z.number().min(0),
  allowances: z.array(allowanceSchema),
  overtime: overtimeSchema,
  annualBonus: z.number().min(0),
  probation: probationSchema, // 🔽 ----- ここに追加 ----- 🔽
  salaryGrowthRate: z.number().min(0),
  deductions: deductionsSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

// 配列としてのシナリオ
export const scenariosSchema = z.array(scenarioSchema)
