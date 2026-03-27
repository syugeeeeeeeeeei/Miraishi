import type {
  FormulaExpression,
  FormulaStep,
  FormulaStepId,
  TaxSchemaV1,
  TaxSchemaV2
} from '@myTypes/miraishi'

export const DEFAULT_PREFECTURE_CODE = 'tokyo'
export const DEFAULT_INDUSTRY_CODE = 'general'

export const PREFECTURE_OPTIONS: { code: string; label: string }[] = [
  { code: 'hokkaido', label: '北海道' },
  { code: 'aomori', label: '青森県' },
  { code: 'iwate', label: '岩手県' },
  { code: 'miyagi', label: '宮城県' },
  { code: 'akita', label: '秋田県' },
  { code: 'yamagata', label: '山形県' },
  { code: 'fukushima', label: '福島県' },
  { code: 'ibaraki', label: '茨城県' },
  { code: 'tochigi', label: '栃木県' },
  { code: 'gunma', label: '群馬県' },
  { code: 'saitama', label: '埼玉県' },
  { code: 'chiba', label: '千葉県' },
  { code: 'tokyo', label: '東京都' },
  { code: 'kanagawa', label: '神奈川県' },
  { code: 'niigata', label: '新潟県' },
  { code: 'toyama', label: '富山県' },
  { code: 'ishikawa', label: '石川県' },
  { code: 'fukui', label: '福井県' },
  { code: 'yamanashi', label: '山梨県' },
  { code: 'nagano', label: '長野県' },
  { code: 'gifu', label: '岐阜県' },
  { code: 'shizuoka', label: '静岡県' },
  { code: 'aichi', label: '愛知県' },
  { code: 'mie', label: '三重県' },
  { code: 'shiga', label: '滋賀県' },
  { code: 'kyoto', label: '京都府' },
  { code: 'osaka', label: '大阪府' },
  { code: 'hyogo', label: '兵庫県' },
  { code: 'nara', label: '奈良県' },
  { code: 'wakayama', label: '和歌山県' },
  { code: 'tottori', label: '鳥取県' },
  { code: 'shimane', label: '島根県' },
  { code: 'okayama', label: '岡山県' },
  { code: 'hiroshima', label: '広島県' },
  { code: 'yamaguchi', label: '山口県' },
  { code: 'tokushima', label: '徳島県' },
  { code: 'kagawa', label: '香川県' },
  { code: 'ehime', label: '愛媛県' },
  { code: 'kochi', label: '高知県' },
  { code: 'fukuoka', label: '福岡県' },
  { code: 'saga', label: '佐賀県' },
  { code: 'nagasaki', label: '長崎県' },
  { code: 'kumamoto', label: '熊本県' },
  { code: 'oita', label: '大分県' },
  { code: 'miyazaki', label: '宮崎県' },
  { code: 'kagoshima', label: '鹿児島県' },
  { code: 'okinawa', label: '沖縄県' }
]

export const INDUSTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'general', label: '一般の事業' },
  { code: 'agricultureForestrySakeManufacturing', label: '農林水産・清酒製造' },
  { code: 'construction', label: '建設業' }
]

const oneDecimalRateByPrefecture = PREFECTURE_OPTIONS.reduce<Record<string, number>>((acc, item) => {
  acc[item.code] = 0.1
  return acc
}, {})

const v = (name: string): FormulaExpression => ({ op: 'var', name })
const c = (value: number): FormulaExpression => ({ op: 'const', value })
const add = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'add', args })
const sub = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'sub', args })
const mul = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'mul', args })
const div = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'div', args })
const min = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'min', args })
const max = (...args: FormulaExpression[]): FormulaExpression => ({ op: 'max', args })
const round = (value: FormulaExpression, digits: number): FormulaExpression => ({
  op: 'round',
  value,
  digits
})

export const FORMULA_STEP_IDS: FormulaStepId[] = [
  'income.annualBasicSalary',
  'income.annualFixedOvertime',
  'income.annualVariableOvertime',
  'income.annualAllowances',
  'income.annualBonus',
  'income.grossAnnualIncome',
  'insurance.health',
  'insurance.pension',
  'insurance.employment',
  'deductions.basic',
  'deductions.spouse',
  'deductions.dependent',
  'deductions.otherTotal',
  'taxableIncome',
  'taxes.income',
  'taxes.reconstruction',
  'taxes.resident',
  'totals.totalDeductions',
  'totals.netAnnualIncome',
  'projection.nextYearMonthlyBasicSalary'
]

export const defaultFormulaSteps = (): FormulaStep[] => [
  { id: 'income.annualBasicSalary', expr: v('rawAnnualBasicSalary') },
  { id: 'income.annualFixedOvertime', expr: v('rawAnnualFixedOvertime') },
  { id: 'income.annualVariableOvertime', expr: v('rawAnnualVariableOvertime') },
  { id: 'income.annualAllowances', expr: v('rawAnnualAllowances') },
  { id: 'income.annualBonus', expr: v('rawAnnualBonus') },
  {
    id: 'income.grossAnnualIncome',
    expr: add(
      v('income.annualBasicSalary'),
      v('income.annualFixedOvertime'),
      v('income.annualVariableOvertime'),
      v('income.annualAllowances'),
      v('income.annualBonus')
    )
  },
  {
    id: 'insurance.health',
    expr: mul(
      min(
        mul(round(div(div(v('income.grossAnnualIncome'), c(12)), c(1000)), 0), c(1000)),
        v('healthInsuranceMaxStandardRemuneration')
      ),
      v('healthInsuranceRateEmployee'),
      c(12)
    )
  },
  {
    id: 'insurance.pension',
    expr: mul(
      min(
        min(
          mul(round(div(div(v('income.grossAnnualIncome'), c(12)), c(1000)), 0), c(1000)),
          v('healthInsuranceMaxStandardRemuneration')
        ),
        v('pensionMaxStandardRemuneration')
      ),
      v('pensionRateEmployee'),
      c(12)
    )
  },
  {
    id: 'insurance.employment',
    expr: mul(v('income.grossAnnualIncome'), v('employmentInsuranceRateEmployee'))
  },
  {
    id: 'deductions.basic',
    expr: {
      op: 'bracketLookup',
      value: v('income.grossAnnualIncome'),
      tableVar: 'basicByTotalIncome',
      thresholdKey: 'maxTotalIncome',
      targetKey: 'amount',
      defaultValue: c(0)
    }
  },
  {
    id: 'deductions.spouse',
    expr: {
      op: 'if',
      condition: v('spouseDeductionAppliedFlag'),
      then: v('spouseDeductionAmount'),
      else: c(0)
    }
  },
  {
    id: 'deductions.dependent',
    expr: mul(v('numberOfDependents'), v('dependentDeductionPerPerson'))
  },
  { id: 'deductions.otherTotal', expr: v('otherDeductionsTotal') },
  {
    id: 'taxableIncome',
    expr: max(
      c(0),
      sub(
        v('income.grossAnnualIncome'),
        add(
          v('insurance.health'),
          v('insurance.pension'),
          v('insurance.employment'),
          v('deductions.basic'),
          v('deductions.spouse'),
          v('deductions.dependent'),
          v('deductions.otherTotal')
        )
      )
    )
  },
  {
    id: 'taxes.income',
    expr: max(
      c(0),
      sub(
        mul(
          v('taxableIncome'),
          {
            op: 'bracketLookup',
            value: v('taxableIncome'),
            tableVar: 'incomeTaxRates',
            thresholdKey: 'threshold',
            targetKey: 'rate',
            defaultValue: c(0)
          }
        ),
        {
          op: 'bracketLookup',
          value: v('taxableIncome'),
          tableVar: 'incomeTaxRates',
          thresholdKey: 'threshold',
          targetKey: 'deduction',
          defaultValue: c(0)
        }
      )
    )
  },
  {
    id: 'taxes.reconstruction',
    expr: mul(v('taxes.income'), v('reconstructionSpecialIncomeTaxRate'))
  },
  {
    id: 'taxes.resident',
    expr: mul(v('residentTaxBaseIncome'), v('residentTaxRate'))
  },
  {
    id: 'totals.totalDeductions',
    expr: add(
      v('insurance.health'),
      v('insurance.pension'),
      v('insurance.employment'),
      v('taxes.income'),
      v('taxes.reconstruction'),
      v('taxes.resident')
    )
  },
  {
    id: 'totals.netAnnualIncome',
    expr: sub(v('income.grossAnnualIncome'), v('totals.totalDeductions'))
  },
  {
    id: 'projection.nextYearMonthlyBasicSalary',
    expr: mul(
      v('baseSalaryForGrowth'),
      add(c(1), div(v('salaryGrowthRatePercent'), c(100)))
    )
  }
]

export const defaultTaxSchemaV2 = (): TaxSchemaV2 => ({
  schemaVersion: '2.0',
  version: '2026.1.0',
  effectiveFrom: '2026-04-01',
  effectiveTo: null,
  rules: {
    incomeTaxRates: [
      { threshold: 1949000, rate: 0.05, deduction: 0 },
      { threshold: 3299000, rate: 0.1, deduction: 97500 },
      { threshold: 6949000, rate: 0.2, deduction: 427500 },
      { threshold: 8999000, rate: 0.23, deduction: 636000 },
      { threshold: 17999000, rate: 0.33, deduction: 1536000 },
      { threshold: 39999000, rate: 0.4, deduction: 2796000 },
      { threshold: null, rate: 0.45, deduction: 4796000 }
    ],
    reconstructionSpecialIncomeTaxRate: 0.021,
    residentTaxRate: 0.1,
    socialInsurance: {
      healthInsurance: {
        rateMode: 'prefecture',
        rate: null,
        rateByPrefecture: oneDecimalRateByPrefecture,
        maxStandardRemuneration: 1390000
      },
      pension: {
        rate: 0.183,
        maxStandardRemuneration: 650000
      },
      employmentInsurance: {
        employeeRateByIndustry: {
          general: 0.005,
          agricultureForestrySakeManufacturing: 0.006,
          construction: 0.006
        }
      }
    },
    deductions: {
      basicByTotalIncome: [
        { maxTotalIncome: 1320000, amount: 950000 },
        { maxTotalIncome: 3360000, amount: 880000 },
        { maxTotalIncome: 4890000, amount: 680000 },
        { maxTotalIncome: 6550000, amount: 630000 },
        { maxTotalIncome: 23500000, amount: 580000 },
        { maxTotalIncome: 24000000, amount: 480000 },
        { maxTotalIncome: 24500000, amount: 320000 },
        { maxTotalIncome: 25000000, amount: 160000 },
        { maxTotalIncome: null, amount: 0 }
      ],
      spouse: 380000,
      dependent: 380000
    }
  },
  formula: {
    steps: defaultFormulaSteps()
  },
  uiMeta: {
    labels: {
      version: '法令バージョン',
      effectiveFrom: '適用開始日',
      effectiveTo: '適用終了日'
    },
    descriptions: {
      version: '税制バージョン。履歴比較時の識別に利用します。',
      effectiveFrom: '税制の適用開始日。YYYY-MM-DD形式。',
      effectiveTo: '税制の適用終了日。無期限の場合は null。'
    }
  }
})

export const migrateTaxSchemaV1ToV2 = (schema: TaxSchemaV1): TaxSchemaV2 => {
  const next = defaultTaxSchemaV2()
  next.version = schema.version
  next.rules.incomeTaxRates = schema.incomeTaxRates
  next.rules.residentTaxRate = schema.residentTaxRate
  next.rules.socialInsurance.healthInsurance.rateMode = 'flat'
  next.rules.socialInsurance.healthInsurance.rate = schema.socialInsurance.healthInsurance.rate
  next.rules.socialInsurance.healthInsurance.maxStandardRemuneration =
    schema.socialInsurance.healthInsurance.maxStandardRemuneration
  next.rules.socialInsurance.pension.rate = schema.socialInsurance.pension.rate
  next.rules.socialInsurance.pension.maxStandardRemuneration =
    schema.socialInsurance.pension.maxStandardRemuneration
  next.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.general =
    schema.socialInsurance.employmentInsurance.rate
  next.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.agricultureForestrySakeManufacturing =
    schema.socialInsurance.employmentInsurance.rate
  next.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.construction =
    schema.socialInsurance.employmentInsurance.rate
  next.rules.deductions.basicByTotalIncome = [{ maxTotalIncome: null, amount: schema.deductions.basic }]
  next.rules.deductions.spouse = schema.deductions.spouse
  next.rules.deductions.dependent = schema.deductions.dependent
  return next
}
