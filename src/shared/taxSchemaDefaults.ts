import type {
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
  { id: 'income.annualBasicSalary', expr: 'rawAnnualBasicSalary' },
  { id: 'income.annualFixedOvertime', expr: 'rawAnnualFixedOvertime' },
  { id: 'income.annualVariableOvertime', expr: 'rawAnnualVariableOvertime' },
  { id: 'income.annualAllowances', expr: 'rawAnnualAllowances' },
  { id: 'income.annualBonus', expr: 'rawAnnualBonus' },
  {
    id: 'income.grossAnnualIncome',
    expr: 'income.annualBasicSalary + income.annualFixedOvertime + income.annualVariableOvertime + income.annualAllowances + income.annualBonus'
  },
  {
    id: 'insurance.health',
    expr: 'min(round(income.grossAnnualIncome / 12 / 1000, 0) * 1000, healthInsuranceMaxStandardRemuneration) * healthInsuranceRateEmployee * 12'
  },
  {
    id: 'insurance.pension',
    expr: 'min(min(round(income.grossAnnualIncome / 12 / 1000, 0) * 1000, healthInsuranceMaxStandardRemuneration), pensionMaxStandardRemuneration) * pensionRateEmployee * 12'
  },
  {
    id: 'insurance.employment',
    expr: 'income.grossAnnualIncome * employmentInsuranceRateEmployee'
  },
  {
    id: 'deductions.basic',
    expr: "bracketLookup(income.grossAnnualIncome, 'basicByTotalIncome', 'maxTotalIncome', 'amount', 0)"
  },
  {
    id: 'deductions.spouse',
    expr: 'if(spouseDeductionAppliedFlag, spouseDeductionAmount, 0)'
  },
  {
    id: 'deductions.dependent',
    expr: 'numberOfDependents * dependentDeductionPerPerson'
  },
  { id: 'deductions.otherTotal', expr: 'otherDeductionsTotal' },
  {
    id: 'taxableIncome',
    expr: 'max(0, income.grossAnnualIncome - (insurance.health + insurance.pension + insurance.employment + deductions.basic + deductions.spouse + deductions.dependent + deductions.otherTotal))'
  },
  {
    id: 'taxes.income',
    expr: "max(0, taxableIncome * bracketLookup(taxableIncome, 'incomeTaxRates', 'threshold', 'rate', 0) - bracketLookup(taxableIncome, 'incomeTaxRates', 'threshold', 'deduction', 0))"
  },
  {
    id: 'taxes.reconstruction',
    expr: 'taxes.income * reconstructionSpecialIncomeTaxRate'
  },
  {
    id: 'taxes.resident',
    expr: 'residentTaxBaseIncome * residentTaxRate'
  },
  {
    id: 'totals.totalDeductions',
    expr: 'insurance.health + insurance.pension + insurance.employment + taxes.income + taxes.reconstruction + taxes.resident'
  },
  {
    id: 'totals.netAnnualIncome',
    expr: 'income.grossAnnualIncome - totals.totalDeductions'
  },
  {
    id: 'projection.nextYearMonthlyBasicSalary',
    expr: 'baseSalaryForGrowth * (1 + salaryGrowthRatePercent / 100)'
  }
]

export const defaultTaxSchemaV2 = (): TaxSchemaV2 => ({
  schemaVersion: '2.0',
  version: '2026.2.0',
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
    },
    items: {
      'rules.incomeTaxRates': {
        name: '所得税率テーブル',
        description: '課税所得の税率帯と控除額を定義します。',
        formulaStepIds: ['taxes.income']
      },
      'rules.reconstructionSpecialIncomeTaxRate': {
        name: '復興特別所得税率',
        description: '所得税額に対して乗算する追加税率です。',
        formulaStepIds: ['taxes.reconstruction']
      },
      'rules.residentTaxRate': {
        name: '住民税率',
        description: '住民税計算ベースに乗算する税率です。',
        formulaStepIds: ['taxes.resident']
      },
      'rules.socialInsurance': {
        name: '社会保険ルール',
        description: '健康保険・厚生年金・雇用保険に関する全体設定です。',
        formulaStepIds: ['insurance.health', 'insurance.pension', 'insurance.employment']
      },
      'rules.socialInsurance.healthInsurance': {
        name: '健康保険ルール',
        description: '健康保険の料率設定と標準報酬上限に関する定義です。',
        formulaStepIds: ['insurance.health', 'insurance.pension']
      },
      'rules.socialInsurance.healthInsurance.rateMode': {
        name: '健康保険料率モード',
        description: '健康保険料率の解決方法（flat / prefecture）を指定します。',
        formulaStepIds: ['insurance.health']
      },
      'rules.socialInsurance.healthInsurance.rate': {
        name: '健康保険料率（flat）',
        description: 'flatモード時に使う健康保険料率（全額）です。',
        formulaStepIds: ['insurance.health']
      },
      'rules.socialInsurance.healthInsurance.rateByPrefecture': {
        name: '健康保険料率（都道府県別）',
        description: 'prefectureモード時に使う都道府県コード別の健康保険料率（全額）です。',
        formulaStepIds: ['insurance.health']
      },
      'rules.socialInsurance.healthInsurance.maxStandardRemuneration': {
        name: '健康保険 標準報酬上限',
        description: '健康保険の標準報酬月額の上限です。',
        formulaStepIds: ['insurance.health', 'insurance.pension']
      },
      'rules.socialInsurance.pension.rate': {
        name: '厚生年金保険料率',
        description: '厚生年金保険料率（全額）です。',
        formulaStepIds: ['insurance.pension']
      },
      'rules.socialInsurance.pension': {
        name: '厚生年金ルール',
        description: '厚生年金保険料率と標準報酬上限の定義です。',
        formulaStepIds: ['insurance.pension']
      },
      'rules.socialInsurance.pension.maxStandardRemuneration': {
        name: '厚生年金 標準報酬上限',
        description: '厚生年金の標準報酬月額の上限です。',
        formulaStepIds: ['insurance.pension']
      },
      'rules.socialInsurance.employmentInsurance': {
        name: '雇用保険ルール',
        description: '雇用保険の業種別料率設定です。',
        formulaStepIds: ['insurance.employment']
      },
      'rules.socialInsurance.employmentInsurance.employeeRateByIndustry': {
        name: '雇用保険率（業種別）',
        description: '業種コードごとの労働者負担率を定義します。',
        formulaStepIds: ['insurance.employment']
      },
      'rules.socialInsurance.employmentInsurance.employeeRateByIndustry.general': {
        name: '雇用保険率（一般）',
        description: '業種コード general に対応する労働者負担率です。',
        formulaStepIds: ['insurance.employment']
      },
      'rules.socialInsurance.employmentInsurance.employeeRateByIndustry.agricultureForestrySakeManufacturing': {
        name: '雇用保険率（農林水産・清酒製造）',
        description: '業種コード agricultureForestrySakeManufacturing に対応する労働者負担率です。',
        formulaStepIds: ['insurance.employment']
      },
      'rules.socialInsurance.employmentInsurance.employeeRateByIndustry.construction': {
        name: '雇用保険率（建設）',
        description: '業種コード construction に対応する労働者負担率です。',
        formulaStepIds: ['insurance.employment']
      },
      'rules.deductions.basicByTotalIncome': {
        name: '基礎控除テーブル',
        description: '合計所得金額帯ごとの基礎控除額を定義します。',
        formulaStepIds: ['deductions.basic']
      },
      'rules.deductions': {
        name: '所得控除ルール',
        description: '基礎控除・配偶者控除・扶養控除の定義です。',
        formulaStepIds: ['deductions.basic', 'deductions.spouse', 'deductions.dependent']
      },
      'rules.deductions.spouse': {
        name: '配偶者控除額',
        description: '配偶者ありの場合に適用する控除額です。',
        formulaStepIds: ['deductions.spouse']
      },
      'rules.deductions.dependent': {
        name: '扶養控除額',
        description: '扶養人数1人あたりの控除額です。',
        formulaStepIds: ['deductions.dependent']
      },
      'formula.steps': {
        name: '計算式ステップ',
        description: '給与計算工程を式として定義した一覧です。'
      }
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
