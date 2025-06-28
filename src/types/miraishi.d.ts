/**
 * @file src/types/miraishi.d.ts
 * @description アプリケーション「未来視」で使用される主要な型定義
 */

/**
 * 手当の支給期間を定義します。
 * - `unlimited`: 無期限
 * - `years`: 年単位で指定
 * - `months`: 月単位で指定
 */
export type Duration =
  | { type: 'unlimited' }
  | { type: 'years'; value: number }
  | { type: 'months'; value: number }

/**
 * 各種手当の詳細を定義します。
 */
export type Allowance = {
  /** 手当を一位に識別するID */
  id: string
  /** 手当の名称 (例: 「住宅手当」) */
  name: string
  /**
   * 手当の種別
   * - `fixed`: 固定額
   * - `percentage`: 基本給に対する割合
   */
  type: 'fixed' | 'percentage'
  /** 手当の金額（円）または割合（例: 0.05） */
  amount: number
  /** 手当の支給期間 */
  duration: Duration
}

/**
 * 固定残業代の詳細を定義します。
 */
export type FixedOvertime = {
  /** 固定残業代制度の有無 */
  enabled: boolean
  /** 固定残業代の月額 */
  amount: number
  /** 金額に含まれる固定残業時間 */
  hours: number
}

/**
 * 変動残業代（時間外手当）の詳細を定義します。
 */
export type VariableOvertime = {
  /** 変動残業代の有無 */
  enabled: boolean
  /**
   * 残業単価の計算方法。
   * @todo 将来的な拡張性のためのフィールド
   */
  calculationMethod: string
}

/**
 * 残業代に関する設定を定義します。
 */
export type Overtime = {
  /** 固定残業代 */
  fixedOvertime: FixedOvertime
  /** 変動残業代 */
  variableOvertime: VariableOvertime
}

/**
 * 扶養家族に関する情報を定義します。
 */
export type Dependents = {
  /** 配偶者の有無 */
  hasSpouse: boolean
  /** 配偶者以外の扶養家族の人数 */
  numberOfDependents: number
}

/**
 * iDeCoや生命保険料控除など、個別の控除項目を定義します。
 */
export type OtherDeduction = {
  /** 控除項目を一位に識別するID */
  id: string
  /** 控除の名称 (例: 「iDeCo」) */
  name: string
  /** 年間の控除額 */
  amount: number
}

/**
 * 税金計算に影響する控除関連の情報を定義します。
 */
export type Deductions = {
  /** 扶養家族の情報 */
  dependents: Dependents
  /** その他の控除項目（iDeCoなど）の配列 */
  otherDeductions: OtherDeduction[]
}

/**
 * シミュレーションの単位となるシナリオの全情報を定義します。
 */
export type Scenario = {
  /** シナリオを一位に識別するID */
  id: string
  /** ユーザーが設定するシナリオの名称 */
  title: string
  /** シミュレーション開始時の基本給（月額） */
  initialBasicSalary: number
  /** 手当の配列 */
  allowances: Allowance[]
  /** 残業代の設定 */
  overtime: Overtime
  /** 年間の給与成長率（%） */
  salaryGrowthRate: number
  /** 控除関連の設定 */
  deductions: Deductions
  /** シナリオの作成日時 */
  createdAt: Date
  /** シナリオの最終更新日時 */
  updatedAt: Date
}

// --- 税制スキーマ関連の型定義 ---

/**
 * 所得税の税率テーブルの一行を定義します。
 */
export type IncomeTaxRate = {
  /** 課税所得の閾値（この額まで）。nullの場合は上限なしを表す */
  threshold: number | null
  /** 税率 */
  rate: number
  /** 控除額 */
  deduction: number
}

/**
 * 法改正に対応するための税制スキーマ全体を定義します。
 * このデータは外部JSONファイルとして管理されます。
 */
export type TaxSchema = {
  /** スキーマのバージョン */
  version: string
  /** 所得税の速算表 */
  incomeTaxRates: IncomeTaxRate[] // 上のIncomeTaxRate型を参照
  /** 住民税の標準税率 */
  residentTaxRate: number
  /** 社会保険料率 */
  socialInsurance: {
    healthInsurance: { rate: number; maxStandardRemuneration: number }
    pension: { rate: number; maxStandardRemuneration: number }
    employmentInsurance: { rate: number }
  }
}
// --- ビュー（UI状態）関連の型定義 ---

/**
 * グラフビューの表示設定を定義します。
 */
export type GraphViewSettings = {
  /** 予測期間（年数） */
  predictionPeriod: number
  /** 予測に用いる月平均残業時間 */
  averageOvertimeHours: number
  /**
   * グラフの表示項目
   * - `grossAnnual`: 年収（額面）
   * - `netAnnual`: 年収（手取り）
   * - `monthlyGross`: 月収（額面）
   * - `monthlyNet`: 月収（手取り）
   */
  displayItem: 'grossAnnual' | 'netAnnual' | 'monthlyGross' | 'monthlyNet'
}

/**
 * アプリケーション全体のUI状態を定義します。
 * Jotaiなどの状態管理ライブラリで管理されることを想定。
 */
export type ViewState = {
  /** メインパネルに表示されているシナリオのIDリスト */
  activeScenarioIds: string[]
  /** グラフビューの設定 */
  graphViewSettings: GraphViewSettings
  /** コントロールパネルの表示状態 */
  isControlPanelOpen: boolean
  /** グラフビューのフロート表示状態 */
  isGraphViewVisible: boolean
}

/**
 * 予測される年間の給与詳細
 */
export interface AnnualSalaryDetail {
  year: number
  grossAnnualIncome: number
  netAnnualIncome: number
  totalDeductions: number
  healthInsurance: number
  pensionInsurance: number
  employmentInsurance: number
  incomeTax: number
  residentTax: number
}

/**
 * 予測結果の全体構造
 */
export interface PredictionResult {
  details: AnnualSalaryDetail[]
}
