import type {
  CompiledFormulaStep,
  CompiledTaxSchemaV2,
  FormulaExpression,
  FormulaStep,
  FormulaStepId,
  TaxSchemaV2
} from '@myTypes/miraishi'
import { FORMULA_STEP_IDS } from '../../shared/taxSchemaDefaults'

const STEP_ID_SET = new Set<FormulaStepId>(FORMULA_STEP_IDS)

const ALLOWED_RUNTIME_VARIABLES = new Set<string>([
  'rawAnnualBasicSalary',
  'rawAnnualFixedOvertime',
  'rawAnnualVariableOvertime',
  'rawAnnualAllowances',
  'rawAnnualBonus',
  'healthInsuranceMaxStandardRemuneration',
  'healthInsuranceRateEmployee',
  'pensionMaxStandardRemuneration',
  'pensionRateEmployee',
  'employmentInsuranceRateEmployee',
  'totalIncomeForBasicDeduction',
  'basicByTotalIncome',
  'spouseDeductionAppliedFlag',
  'spouseDeductionAmount',
  'numberOfDependents',
  'dependentDeductionPerPerson',
  'otherDeductionsTotal',
  'incomeTaxRates',
  'reconstructionSpecialIncomeTaxRate',
  'residentTaxBaseIncome',
  'residentTaxRate',
  'baseSalaryForGrowth',
  'salaryGrowthRatePercent'
])

type ValidateResult = {
  deps: Set<FormulaStepId>
  errors: string[]
}

const asNumber = (value: unknown): number => {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    return 0
  }
  return n
}

const validateExpr = (expr: FormulaExpression, stepId: FormulaStepId): ValidateResult => {
  const deps = new Set<FormulaStepId>()
  const errors: string[] = []

  const visit = (node: FormulaExpression): void => {
    switch (node.op) {
      case 'const': {
        if (!Number.isFinite(node.value)) {
          errors.push(`${stepId}: const.value が有限数ではありません`)
        }
        return
      }
      case 'var': {
        if (STEP_ID_SET.has(node.name as FormulaStepId)) {
          deps.add(node.name as FormulaStepId)
          return
        }
        if (!ALLOWED_RUNTIME_VARIABLES.has(node.name)) {
          errors.push(`${stepId}: 未定義変数 ${node.name}`)
        }
        return
      }
      case 'add':
      case 'sub':
      case 'mul':
      case 'div':
      case 'min':
      case 'max': {
        if (!Array.isArray(node.args) || node.args.length === 0) {
          errors.push(`${stepId}: ${node.op}.args は1件以上必要です`)
          return
        }
        node.args.forEach(visit)
        return
      }
      case 'round': {
        if (!Number.isInteger(node.digits)) {
          errors.push(`${stepId}: round.digits は整数で指定してください`)
        }
        visit(node.value)
        return
      }
      case 'if': {
        visit(node.condition)
        visit(node.then)
        visit(node.else)
        return
      }
      case 'clamp': {
        visit(node.value)
        visit(node.min)
        visit(node.max)
        return
      }
      case 'bracketLookup': {
        if (!node.tableVar) {
          errors.push(`${stepId}: bracketLookup.tableVar は必須です`)
        }
        if (!node.thresholdKey || !node.targetKey) {
          errors.push(`${stepId}: bracketLookup.thresholdKey/targetKey は必須です`)
        }
        visit(node.value)
        if (node.defaultValue) {
          visit(node.defaultValue)
        }
        return
      }
      case 'tableLookup': {
        if (!node.tableVar) {
          errors.push(`${stepId}: tableLookup.tableVar は必須です`)
        }
        visit(node.key)
        if (node.defaultValue) {
          visit(node.defaultValue)
        }
        return
      }
      default: {
        errors.push(`${stepId}: 未許可演算子`)
      }
    }
  }

  visit(expr)
  return { deps, errors }
}

const sortSteps = (stepMap: Map<FormulaStepId, CompiledFormulaStep>): FormulaStepId[] => {
  const inDegree = new Map<FormulaStepId, number>()
  const adjacency = new Map<FormulaStepId, FormulaStepId[]>()

  FORMULA_STEP_IDS.forEach((id) => {
    inDegree.set(id, 0)
    adjacency.set(id, [])
  })

  for (const [id, step] of stepMap.entries()) {
    step.deps.forEach((dep) => {
      adjacency.get(dep)?.push(id)
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
    })
  }

  const queue: FormulaStepId[] = FORMULA_STEP_IDS.filter((id) => (inDegree.get(id) ?? 0) === 0)
  const result: FormulaStepId[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    result.push(current)

    for (const next of adjacency.get(current) ?? []) {
      const nextDegree = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, nextDegree)
      if (nextDegree === 0) {
        queue.push(next)
      }
    }
  }

  if (result.length !== FORMULA_STEP_IDS.length) {
    throw new Error('formula.steps に循環依存があります。')
  }

  return result
}

export const compileTaxSchemaV2 = (schema: TaxSchemaV2): CompiledTaxSchemaV2 => {
  const errors: string[] = []
  const duplicated = new Set<string>()
  const stepMap = new Map<FormulaStepId, CompiledFormulaStep>()

  for (const step of schema.formula.steps) {
    if (!STEP_ID_SET.has(step.id)) {
      errors.push(`未知の step id: ${step.id}`)
      continue
    }
    if (stepMap.has(step.id)) {
      duplicated.add(step.id)
      continue
    }

    const validateResult = validateExpr(step.expr, step.id)
    errors.push(...validateResult.errors)
    stepMap.set(step.id, {
      id: step.id,
      expr: step.expr,
      deps: Array.from(validateResult.deps)
    })
  }

  if (duplicated.size > 0) {
    errors.push(`重複した step id: ${Array.from(duplicated).join(', ')}`)
  }

  for (const id of FORMULA_STEP_IDS) {
    if (!stepMap.has(id)) {
      errors.push(`不足している step id: ${id}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  const order = sortSteps(stepMap)

  return {
    schema,
    stepOrder: order,
    stepMap: Object.fromEntries(stepMap.entries()) as CompiledTaxSchemaV2['stepMap']
  }
}

const evaluateExpr = (
  expr: FormulaExpression,
  runtimeVars: Record<string, unknown>,
  stepValues: Record<string, number>
): number => {
  switch (expr.op) {
    case 'const':
      return expr.value
    case 'var': {
      if (expr.name in stepValues) {
        return asNumber(stepValues[expr.name])
      }
      return asNumber(runtimeVars[expr.name])
    }
    case 'add':
      return expr.args.reduce((sum, arg) => sum + evaluateExpr(arg, runtimeVars, stepValues), 0)
    case 'sub': {
      const values = expr.args.map((arg) => evaluateExpr(arg, runtimeVars, stepValues))
      return values.slice(1).reduce((acc, value) => acc - value, values[0] ?? 0)
    }
    case 'mul':
      return expr.args.reduce((acc, arg) => acc * evaluateExpr(arg, runtimeVars, stepValues), 1)
    case 'div': {
      const values = expr.args.map((arg) => evaluateExpr(arg, runtimeVars, stepValues))
      return values.slice(1).reduce((acc, value) => {
        if (value === 0) {
          return 0
        }
        return acc / value
      }, values[0] ?? 0)
    }
    case 'min':
      return Math.min(...expr.args.map((arg) => evaluateExpr(arg, runtimeVars, stepValues)))
    case 'max':
      return Math.max(...expr.args.map((arg) => evaluateExpr(arg, runtimeVars, stepValues)))
    case 'round': {
      const factor = Math.pow(10, expr.digits)
      return Math.round(evaluateExpr(expr.value, runtimeVars, stepValues) * factor) / factor
    }
    case 'if': {
      const condition = evaluateExpr(expr.condition, runtimeVars, stepValues)
      return condition !== 0
        ? evaluateExpr(expr.then, runtimeVars, stepValues)
        : evaluateExpr(expr.else, runtimeVars, stepValues)
    }
    case 'clamp': {
      const value = evaluateExpr(expr.value, runtimeVars, stepValues)
      const minValue = evaluateExpr(expr.min, runtimeVars, stepValues)
      const maxValue = evaluateExpr(expr.max, runtimeVars, stepValues)
      return Math.min(Math.max(value, minValue), maxValue)
    }
    case 'bracketLookup': {
      const table = runtimeVars[expr.tableVar]
      if (!Array.isArray(table)) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      const targetValue = evaluateExpr(expr.value, runtimeVars, stepValues)
      const matched = table.find((row) => {
        if (!row || typeof row !== 'object') {
          return false
        }
        const threshold = (row as Record<string, unknown>)[expr.thresholdKey]
        if (threshold === null || threshold === undefined) {
          return true
        }
        return targetValue <= asNumber(threshold)
      }) as Record<string, unknown> | undefined

      if (!matched) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      const resolved = matched[expr.targetKey]
      if (resolved === undefined || resolved === null) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      return asNumber(resolved)
    }
    case 'tableLookup': {
      const table = runtimeVars[expr.tableVar]
      if (!table || typeof table !== 'object' || Array.isArray(table)) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      const key = String(evaluateExpr(expr.key, runtimeVars, stepValues))
      const resolved = (table as Record<string, unknown>)[key]
      if (resolved === undefined || resolved === null) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      return asNumber(resolved)
    }
    default:
      return 0
  }
}

export const evaluateCompiledFormula = (
  compiledSchema: CompiledTaxSchemaV2,
  runtimeVars: Record<string, unknown>
): Record<FormulaStepId, number> => {
  const stepValues: Partial<Record<FormulaStepId, number>> = {}

  for (const stepId of compiledSchema.stepOrder) {
    const step = compiledSchema.stepMap[stepId]
    if (!step) {
      throw new Error(`Formula step not compiled: ${stepId}`)
    }
    const value = evaluateExpr(step.expr, runtimeVars, stepValues)
    stepValues[stepId] = Number.isFinite(value) ? value : 0
  }

  return stepValues as Record<FormulaStepId, number>
}

export const ensureStepOrderMatches = (steps: FormulaStep[]): void => {
  const ids = steps.map((step) => step.id)
  for (const id of FORMULA_STEP_IDS) {
    if (!ids.includes(id)) {
      throw new Error(`必須stepが不足しています: ${id}`)
    }
  }
}
