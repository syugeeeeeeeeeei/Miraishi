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

const DANGEROUS_KEYS = new Set<string>(['__proto__', 'prototype', 'constructor'])

const MAX_EXPRESSION_LENGTH = 4000
const MAX_AST_NODE_COUNT = 600
const MAX_PARSE_DEPTH = 80
const MAX_TOKENS = 3000

type ValidateResult = {
  deps: Set<FormulaStepId>
  errors: string[]
}

type TokenType =
  | 'number'
  | 'identifier'
  | 'string'
  | '+'
  | '-'
  | '*'
  | '/'
  | '('
  | ')'
  | ','
  | 'eof'

type Token = {
  type: TokenType
  value?: string
}

type ParsedExpression =
  | { kind: 'number'; value: number }
  | { kind: 'identifier'; name: string }
  | { kind: 'string'; value: string }
  | { kind: 'call'; name: string; args: ParsedExpression[] }
  | { kind: 'binary'; op: '+' | '-' | '*' | '/'; left: ParsedExpression; right: ParsedExpression }
  | { kind: 'unary'; op: '+' | '-'; value: ParsedExpression }

const asNumber = (value: unknown): number => {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    return 0
  }
  return n
}

const isIdentifierStart = (char: string): boolean => /[A-Za-z_]/.test(char)
const isIdentifierPart = (char: string): boolean => /[A-Za-z0-9_.]/.test(char)

const throwParseError = (stepId: FormulaStepId, message: string): never => {
  throw new Error(`${stepId}: ${message}`)
}

const tokenize = (source: string, stepId: FormulaStepId): Token[] => {
  if (source.length > MAX_EXPRESSION_LENGTH) {
    throwParseError(stepId, `式が長すぎます（最大 ${MAX_EXPRESSION_LENGTH} 文字）`)
  }

  const tokens: Token[] = []
  let index = 0

  while (index < source.length) {
    const ch = source[index]

    if (/\s/.test(ch)) {
      index += 1
      continue
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')' || ch === ',') {
      tokens.push({ type: ch })
      index += 1
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      index += 1
      let value = ''
      while (index < source.length) {
        const current = source[index]
        if (current === '\\') {
          const escaped = source[index + 1]
          if (!escaped) {
            throwParseError(stepId, '文字列リテラルのエスケープが不正です')
          }
          if (escaped === 'n') value += '\n'
          else if (escaped === 't') value += '\t'
          else if (escaped === 'r') value += '\r'
          else value += escaped
          index += 2
          continue
        }
        if (current === quote) {
          index += 1
          break
        }
        value += current
        index += 1
      }
      if (source[index - 1] !== quote) {
        throwParseError(stepId, '文字列リテラルが閉じられていません')
      }
      tokens.push({ type: 'string', value })
      continue
    }

    const next = source[index + 1]
    if (/\d/.test(ch) || (ch === '.' && next && /\d/.test(next))) {
      const start = index
      let hasDot = ch === '.'
      index += 1
      while (index < source.length) {
        const current = source[index]
        if (current === '.') {
          if (hasDot) {
            break
          }
          hasDot = true
          index += 1
          continue
        }
        if (!/\d/.test(current)) {
          break
        }
        index += 1
      }
      const raw = source.slice(start, index)
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throwParseError(stepId, `数値が不正です: ${raw}`)
      }
      tokens.push({ type: 'number', value: raw })
      continue
    }

    if (isIdentifierStart(ch)) {
      const start = index
      index += 1
      while (index < source.length && isIdentifierPart(source[index])) {
        index += 1
      }
      const identifier = source.slice(start, index)
      tokens.push({ type: 'identifier', value: identifier })
      continue
    }

    throwParseError(stepId, `未許可の文字です: ${ch}`)
  }

  if (tokens.length > MAX_TOKENS) {
    throwParseError(stepId, `式トークン数が上限を超えています（最大 ${MAX_TOKENS}）`)
  }

  tokens.push({ type: 'eof' })
  return tokens
}

class FormulaParser {
  private index = 0

  private nodeCount = 0

  constructor(
    private readonly tokens: Token[],
    private readonly stepId: FormulaStepId
  ) {}

  parse(): ParsedExpression {
    const expr = this.parseAdditive(0)
    this.expect('eof', '式の末尾に余分なトークンがあります')
    return expr
  }

  private createNode<T extends ParsedExpression>(node: T, depth: number): T {
    if (depth > MAX_PARSE_DEPTH) {
      throwParseError(this.stepId, `式のネストが深すぎます（最大 ${MAX_PARSE_DEPTH}）`)
    }
    this.nodeCount += 1
    if (this.nodeCount > MAX_AST_NODE_COUNT) {
      throwParseError(this.stepId, `式ノード数が上限を超えています（最大 ${MAX_AST_NODE_COUNT}）`)
    }
    return node
  }

  private peek(): Token {
    return this.tokens[this.index] ?? { type: 'eof' }
  }

  private consume(): Token {
    const token = this.peek()
    this.index += 1
    return token
  }

  private expect(type: TokenType, message: string): Token {
    const token = this.consume()
    if (token.type !== type) {
      throwParseError(this.stepId, message)
    }
    return token
  }

  private match(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.consume()
      return true
    }
    return false
  }

  private parseAdditive(depth: number): ParsedExpression {
    let left = this.parseMultiplicative(depth + 1)

    while (true) {
      const token = this.peek()
      if (token.type !== '+' && token.type !== '-') {
        break
      }
      this.consume()
      const right = this.parseMultiplicative(depth + 1)
      left = this.createNode({ kind: 'binary', op: token.type, left, right }, depth)
    }

    return left
  }

  private parseMultiplicative(depth: number): ParsedExpression {
    let left = this.parseUnary(depth + 1)

    while (true) {
      const token = this.peek()
      if (token.type !== '*' && token.type !== '/') {
        break
      }
      this.consume()
      const right = this.parseUnary(depth + 1)
      left = this.createNode({ kind: 'binary', op: token.type, left, right }, depth)
    }

    return left
  }

  private parseUnary(depth: number): ParsedExpression {
    const token = this.peek()
    if (token.type === '+' || token.type === '-') {
      this.consume()
      const value = this.parseUnary(depth + 1)
      return this.createNode({ kind: 'unary', op: token.type, value }, depth)
    }
    return this.parsePrimary(depth + 1)
  }

  private parsePrimary(depth: number): ParsedExpression {
    const token = this.peek()

    if (token.type === 'number') {
      this.consume()
      return this.createNode({ kind: 'number', value: Number(token.value) }, depth)
    }

    if (token.type === 'string') {
      this.consume()
      return this.createNode({ kind: 'string', value: token.value ?? '' }, depth)
    }

    if (token.type === 'identifier') {
      this.consume()
      const name = token.value ?? ''
      if (this.match('(')) {
        const args: ParsedExpression[] = []
        if (!this.match(')')) {
          do {
            args.push(this.parseAdditive(depth + 1))
          } while (this.match(','))
          this.expect(')', '関数呼び出しの閉じ括弧が不足しています')
        }
        return this.createNode({ kind: 'call', name, args }, depth)
      }
      return this.createNode({ kind: 'identifier', name }, depth)
    }

    if (this.match('(')) {
      const expr = this.parseAdditive(depth + 1)
      this.expect(')', '閉じ括弧が不足しています')
      return expr
    }

    return throwParseError(this.stepId, `式の構文が不正です（token: ${token.type}）`)
  }
}

const ensureNotDangerousName = (value: string, stepId: FormulaStepId, kind: '変数名' | 'キー名'): string => {
  if (!value || DANGEROUS_KEYS.has(value)) {
    throwParseError(stepId, `${kind}が不正です: ${value}`)
  }
  return value
}

const readStringLiteral = (expr: ParsedExpression, stepId: FormulaStepId, label: string): string => {
  if (expr.kind !== 'string') {
    return throwParseError(stepId, `${label} には文字列リテラルを指定してください`)
  }
  return ensureNotDangerousName(expr.value, stepId, 'キー名')
}

const readIntegerLiteral = (expr: ParsedExpression, stepId: FormulaStepId, label: string): number => {
  if (expr.kind !== 'number' || !Number.isInteger(expr.value)) {
    return throwParseError(stepId, `${label} には整数リテラルを指定してください`)
  }
  return expr.value
}

const toFormulaExpression = (parsed: ParsedExpression, stepId: FormulaStepId): FormulaExpression => {
  switch (parsed.kind) {
    case 'number':
      return { op: 'const', value: parsed.value }
    case 'identifier':
      return { op: 'var', name: ensureNotDangerousName(parsed.name, stepId, '変数名') }
    case 'string':
      return throwParseError(stepId, '文字列リテラルは関数引数としてのみ使用できます')
    case 'unary': {
      if (parsed.op === '+') {
        return toFormulaExpression(parsed.value, stepId)
      }
      return {
        op: 'sub',
        args: [{ op: 'const', value: 0 }, toFormulaExpression(parsed.value, stepId)]
      }
    }
    case 'binary': {
      const left = toFormulaExpression(parsed.left, stepId)
      const right = toFormulaExpression(parsed.right, stepId)
      if (parsed.op === '+') return { op: 'add', args: [left, right] }
      if (parsed.op === '-') return { op: 'sub', args: [left, right] }
      if (parsed.op === '*') return { op: 'mul', args: [left, right] }
      return { op: 'div', args: [left, right] }
    }
    case 'call': {
      const name = parsed.name

      if (name === 'add' || name === 'sub' || name === 'mul' || name === 'div' || name === 'min' || name === 'max') {
        if (parsed.args.length < 1) {
          throwParseError(stepId, `${name} は1引数以上必要です`)
        }
        return {
          op: name,
          args: parsed.args.map((arg) => toFormulaExpression(arg, stepId))
        }
      }

      if (name === 'round') {
        if (parsed.args.length !== 2) {
          throwParseError(stepId, 'round は2引数が必要です')
        }
        return {
          op: 'round',
          value: toFormulaExpression(parsed.args[0], stepId),
          digits: readIntegerLiteral(parsed.args[1], stepId, 'round の第2引数')
        }
      }

      if (name === 'if') {
        if (parsed.args.length !== 3) {
          throwParseError(stepId, 'if は3引数が必要です')
        }
        return {
          op: 'if',
          condition: toFormulaExpression(parsed.args[0], stepId),
          then: toFormulaExpression(parsed.args[1], stepId),
          else: toFormulaExpression(parsed.args[2], stepId)
        }
      }

      if (name === 'clamp') {
        if (parsed.args.length !== 3) {
          throwParseError(stepId, 'clamp は3引数が必要です')
        }
        return {
          op: 'clamp',
          value: toFormulaExpression(parsed.args[0], stepId),
          min: toFormulaExpression(parsed.args[1], stepId),
          max: toFormulaExpression(parsed.args[2], stepId)
        }
      }

      if (name === 'bracketLookup') {
        if (parsed.args.length !== 4 && parsed.args.length !== 5) {
          throwParseError(stepId, 'bracketLookup は4または5引数が必要です')
        }
        return {
          op: 'bracketLookup',
          value: toFormulaExpression(parsed.args[0], stepId),
          tableVar: readStringLiteral(parsed.args[1], stepId, 'bracketLookup の tableVar'),
          thresholdKey: readStringLiteral(parsed.args[2], stepId, 'bracketLookup の thresholdKey'),
          targetKey: readStringLiteral(parsed.args[3], stepId, 'bracketLookup の targetKey'),
          defaultValue:
            parsed.args.length === 5 ? toFormulaExpression(parsed.args[4], stepId) : undefined
        }
      }

      if (name === 'tableLookup') {
        if (parsed.args.length !== 2 && parsed.args.length !== 3) {
          throwParseError(stepId, 'tableLookup は2または3引数が必要です')
        }
        return {
          op: 'tableLookup',
          key: toFormulaExpression(parsed.args[0], stepId),
          tableVar: readStringLiteral(parsed.args[1], stepId, 'tableLookup の tableVar'),
          defaultValue:
            parsed.args.length === 3 ? toFormulaExpression(parsed.args[2], stepId) : undefined
        }
      }

      return throwParseError(stepId, `未許可関数です: ${name}`)
    }
  }
}

export const parseFormulaExpression = (sourceExpression: string, stepId: FormulaStepId): FormulaExpression => {
  const trimmed = sourceExpression.trim()
  if (!trimmed) {
    throwParseError(stepId, '式が空です')
  }

  const tokens = tokenize(trimmed, stepId)
  const parser = new FormulaParser(tokens, stepId)
  const parsed = parser.parse()
  return toFormulaExpression(parsed, stepId)
}

const expressionToString = (expr: FormulaExpression, parentPrecedence = 0): string => {
  const toStr = (child: FormulaExpression, precedence: number): string =>
    expressionToString(child, precedence)

  switch (expr.op) {
    case 'const':
      return Number.isInteger(expr.value) ? `${expr.value}` : `${expr.value}`
    case 'var':
      return expr.name
    case 'add': {
      const rendered = expr.args.map((arg) => toStr(arg, 1)).join(' + ')
      return parentPrecedence > 1 ? `(${rendered})` : rendered
    }
    case 'sub': {
      const rendered = expr.args.map((arg) => toStr(arg, 1)).join(' - ')
      return parentPrecedence > 1 ? `(${rendered})` : rendered
    }
    case 'mul': {
      const rendered = expr.args.map((arg) => toStr(arg, 2)).join(' * ')
      return parentPrecedence > 2 ? `(${rendered})` : rendered
    }
    case 'div': {
      const rendered = expr.args.map((arg) => toStr(arg, 2)).join(' / ')
      return parentPrecedence > 2 ? `(${rendered})` : rendered
    }
    case 'min':
      return `min(${expr.args.map((arg) => expressionToString(arg)).join(', ')})`
    case 'max':
      return `max(${expr.args.map((arg) => expressionToString(arg)).join(', ')})`
    case 'round':
      return `round(${expressionToString(expr.value)}, ${expr.digits})`
    case 'if':
      return `if(${expressionToString(expr.condition)}, ${expressionToString(expr.then)}, ${expressionToString(expr.else)})`
    case 'clamp':
      return `clamp(${expressionToString(expr.value)}, ${expressionToString(expr.min)}, ${expressionToString(expr.max)})`
    case 'bracketLookup': {
      const defaultSegment = expr.defaultValue ? `, ${expressionToString(expr.defaultValue)}` : ''
      return `bracketLookup(${expressionToString(expr.value)}, '${expr.tableVar}', '${expr.thresholdKey}', '${expr.targetKey}'${defaultSegment})`
    }
    case 'tableLookup': {
      const defaultSegment = expr.defaultValue ? `, ${expressionToString(expr.defaultValue)}` : ''
      return `tableLookup(${expressionToString(expr.key)}, '${expr.tableVar}'${defaultSegment})`
    }
    default:
      return '0'
  }
}

export const formulaExpressionToString = (expr: FormulaExpression): string => expressionToString(expr)

export const normalizeFormulaStepExpression = (
  step: FormulaStep
): { id: FormulaStepId; expr: FormulaExpression } => {
  const normalizedExpression =
    typeof step.expr === 'string' ? parseFormulaExpression(step.expr, step.id) : step.expr

  return {
    id: step.id,
    expr: normalizedExpression
  }
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
        if (DANGEROUS_KEYS.has(node.name)) {
          errors.push(`${stepId}: 危険な変数名は使用できません (${node.name})`)
          return
        }
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
        if (!node.tableVar || DANGEROUS_KEYS.has(node.tableVar)) {
          errors.push(`${stepId}: bracketLookup.tableVar が不正です`)
        }
        if (
          !node.thresholdKey ||
          !node.targetKey ||
          DANGEROUS_KEYS.has(node.thresholdKey) ||
          DANGEROUS_KEYS.has(node.targetKey)
        ) {
          errors.push(`${stepId}: bracketLookup.thresholdKey/targetKey が不正です`)
        }
        visit(node.value)
        if (node.defaultValue) {
          visit(node.defaultValue)
        }
        return
      }
      case 'tableLookup': {
        if (!node.tableVar || DANGEROUS_KEYS.has(node.tableVar)) {
          errors.push(`${stepId}: tableLookup.tableVar が不正です`)
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

    let normalizedExpr: FormulaExpression
    try {
      normalizedExpr = normalizeFormulaStepExpression(step).expr
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${step.id}: 式のパースに失敗しました`)
      continue
    }

    const validateResult = validateExpr(normalizedExpr, step.id)
    errors.push(...validateResult.errors)
    stepMap.set(step.id, {
      id: step.id,
      expr: normalizedExpr,
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

const getOwnSafeValue = (record: Record<string, unknown>, key: string): unknown => {
  if (DANGEROUS_KEYS.has(key)) {
    return undefined
  }
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    return undefined
  }
  return record[key]
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
        const record = row as Record<string, unknown>
        const threshold = getOwnSafeValue(record, expr.thresholdKey)
        if (threshold === null || threshold === undefined) {
          return true
        }
        return targetValue <= asNumber(threshold)
      }) as Record<string, unknown> | undefined

      if (!matched) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }

      const resolved = getOwnSafeValue(matched, expr.targetKey)
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
      if (DANGEROUS_KEYS.has(key)) {
        return expr.defaultValue ? evaluateExpr(expr.defaultValue, runtimeVars, stepValues) : 0
      }
      const resolved = getOwnSafeValue(table as Record<string, unknown>, key)
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
