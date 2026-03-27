/**
 * @file src/types/miraishi.d.ts
 * @description アプリケーション「未来視」で使用される主要な型定義
 */

export type Duration =
  | { type: 'unlimited' }
  | { type: 'years'; value: number }
  | { type: 'months'; value: number }

export type Allowance = {
  id: string
  name: string
  type: 'fixed' | 'percentage'
  amount: number
  duration: Duration
}

export type FixedOvertime = {
  enabled: boolean
  hours: number
}

export type VariableOvertime = {
  enabled: boolean
  calculationMethod: string
}

export type Overtime = {
  fixedOvertime: FixedOvertime
  variableOvertime: VariableOvertime
}

export type Bonus = {
  mode: 'fixed' | 'basicSalaryMonths'
  months: number
}

export type Probation = {
  enabled: boolean
  durationMonths: number
  basicSalary: number
}

export type Dependents = {
  hasSpouse: boolean
  numberOfDependents: number
}

export type OtherDeduction = {
  id: string
  name: string
  amount: number
}

export type Deductions = {
  dependents: Dependents
  otherDeductions: OtherDeduction[]
  previousYearIncome?: number
}

export type TaxProfile = {
  prefectureCode: string
  industryCode: string
}

export type Scenario = {
  id: string
  title: string
  initialGrossSalary: number
  initialBasicSalary: number
  annualHolidays: number
  allowances: Allowance[]
  overtime: Overtime
  annualBonus: number
  bonus?: Bonus
  probation: Probation
  salaryGrowthRate: number
  deductions: Deductions
  taxProfile: TaxProfile
  createdAt: Date
  updatedAt: Date
}

export type IncomeTaxRate = {
  threshold: number | null
  rate: number
  deduction: number
}

export type TaxSchemaV1 = {
  version: string
  incomeTaxRates: IncomeTaxRate[]
  residentTaxRate: number
  socialInsurance: {
    healthInsurance: { rate: number; maxStandardRemuneration: number }
    pension: { rate: number; maxStandardRemuneration: number }
    employmentInsurance: { rate: number }
  }
  deductions: {
    basic: number
    spouse: number
    dependent: number
  }
}

export type BasicDeductionTableRow = {
  maxTotalIncome: number | null
  amount: number
}

export type TaxSchemaV2 = {
  schemaVersion: '2.0'
  version: string
  effectiveFrom: string
  effectiveTo: string | null
  rules: {
    incomeTaxRates: IncomeTaxRate[]
    reconstructionSpecialIncomeTaxRate: number
    residentTaxRate: number
    socialInsurance: {
      healthInsurance: {
        rateMode: 'flat' | 'prefecture'
        rate: number | null
        rateByPrefecture: Record<string, number>
        maxStandardRemuneration: number
      }
      pension: {
        rate: number
        maxStandardRemuneration: number
      }
      employmentInsurance: {
        employeeRateByIndustry: Record<string, number>
      }
    }
    deductions: {
      basicByTotalIncome: BasicDeductionTableRow[]
      spouse: number
      dependent: number
    }
  }
  formula: {
    steps: FormulaStep[]
  }
  uiMeta: {
    labels: Record<string, string>
    descriptions: Record<string, string>
    items: Record<string, TaxSchemaUiMetaItem>
  }
}

export type TaxSchema = TaxSchemaV1 | TaxSchemaV2

export type FormulaStepId =
  | 'income.annualBasicSalary'
  | 'income.annualFixedOvertime'
  | 'income.annualVariableOvertime'
  | 'income.annualAllowances'
  | 'income.annualBonus'
  | 'income.grossAnnualIncome'
  | 'insurance.health'
  | 'insurance.pension'
  | 'insurance.employment'
  | 'deductions.basic'
  | 'deductions.spouse'
  | 'deductions.dependent'
  | 'deductions.otherTotal'
  | 'taxableIncome'
  | 'taxes.income'
  | 'taxes.reconstruction'
  | 'taxes.resident'
  | 'totals.totalDeductions'
  | 'totals.netAnnualIncome'
  | 'projection.nextYearMonthlyBasicSalary'

export type TaxSchemaUiMetaItem = {
  name: string
  description: string
  formulaStepIds?: FormulaStepId[]
}

export type FormulaExpression =
  | { op: 'const'; value: number }
  | { op: 'var'; name: string }
  | { op: 'add' | 'sub' | 'mul' | 'div' | 'min' | 'max'; args: FormulaExpression[] }
  | { op: 'round'; value: FormulaExpression; digits: number }
  | {
      op: 'if'
      condition: FormulaExpression
      then: FormulaExpression
      else: FormulaExpression
    }
  | { op: 'clamp'; value: FormulaExpression; min: FormulaExpression; max: FormulaExpression }
  | {
      op: 'bracketLookup'
      value: FormulaExpression
      tableVar: string
      thresholdKey: string
      targetKey: string
      defaultValue?: FormulaExpression
    }
  | {
      op: 'tableLookup'
      key: FormulaExpression
      tableVar: string
      defaultValue?: FormulaExpression
    }

export type FormulaStepExpression = string | FormulaExpression

export type FormulaStep = {
  id: FormulaStepId
  expr: FormulaStepExpression
}

export type CompiledFormulaStep = {
  id: FormulaStepId
  expr: FormulaExpression
  deps: FormulaStepId[]
}

export type CompiledTaxSchemaV2 = {
  schema: TaxSchemaV2
  stepOrder: FormulaStepId[]
  stepMap: Partial<Record<FormulaStepId, CompiledFormulaStep>>
}

export type TaxSchemaSnapshot = {
  id: string
  hash: string
  schemaVersion: string
  lawVersion: string
  createdAt: string
  note: string
  schema: TaxSchemaV2
}

export type TaxSchemaState = {
  activeSnapshotId: string | null
  snapshots: TaxSchemaSnapshot[]
  legacyBackups: TaxSchemaV1[]
}

export type TaxSchemaDiffSummary = {
  added: string[]
  removed: string[]
  changed: string[]
  totalChanges: number
}

export type SchemaValidationReport = {
  isValid: boolean
  errors: string[]
  warnings: string[]
  normalizedSchema?: TaxSchemaV2
  diffSummary?: TaxSchemaDiffSummary
}

export type GraphViewSettings = {
  predictionPeriod: number
  averageOvertimeHours: number
  displayItem: ('grossAnnual' | 'netAnnual' | 'monthlyGross' | 'monthlyNet')[]
}

export type ViewState = {
  activeScenarioIds: string[]
  graphViewSettings: GraphViewSettings
  isControlPanelOpen: boolean
  isGraphViewVisible: boolean
}

export interface AnnualSalaryDetail {
  year: number
  grossAnnualIncome: number
  netAnnualIncome: number
  totalDeductions: number

  breakdown: {
    income: {
      annualBasicSalary: number
      annualAllowances: number
      annualBonus: number
      annualFixedOvertime: number
      annualVariableOvertime: number
    }
    deductions: {
      healthInsurance: number
      pensionInsurance: number
      employmentInsurance: number
      incomeTax: number
      reconstructionSpecialIncomeTax: number
      residentTax: number
    }
  }

  calculationTrace: {
    rules: {
      salaryGrowthRatePercent: number
      annualHolidays: number
      bonusMode: 'fixed' | 'basicSalaryMonths'
      bonusMonths: number
      averageOvertimeHours: number
      fixedOvertimeHours: number
      overtimePremiumRate: number
      healthInsuranceRate: number
      pensionInsuranceRate: number
      employmentInsuranceRate: number
      residentTaxRate: number
      reconstructionSpecialIncomeTaxRate: number
    }
    intermediate: {
      isProbationApplied: boolean
      probationMonths: number
      monthlyBasicSalaryForBonus: number
      monthlySalaryForOvertimeCalc: number
      monthlyStandardWorkingHours: number
      hourlyWage: number
      overtimeHours: number
      monthlyGrossIncome: number
      standardMonthlyRemuneration: number
      socialInsuranceTotal: number
      totalIncomeDeductions: number
      taxableIncome: number
      totalIncomeForBasicDeduction: number
      residentTaxBaseIncome: number
      residentTaxBaseSource: 'previousYearInput' | 'previousSimulationYearTaxableIncome'
    }
    deductionRules: {
      basicDeduction: number
      spouseDeduction: number
      spouseDeductionApplied: boolean
      dependentDeductionPerPerson: number
      numberOfDependents: number
      otherDeductionsTotal: number
    }
    incomeTaxRule: {
      bracketUpper: number | null
      rate: number
      deduction: number
    }
    nextYearProjection: {
      baseSalaryForGrowth: number
      growthMultiplier: number
      nextYearMonthlyBasicSalary: number
    }
  }
}

export interface PredictionResult {
  details: AnnualSalaryDetail[]
}
