/**
 * 手当の種類
 * - fixed: 固定金額
 * - percentage: 基本給に対する割合
 */
export type AllowanceType = 'fixed' | 'percentage'

/**
 * 手当の期限
 * - unlimited: 無期限
 * - years: 年単位
 * - months: 月単位
 */
export type AllowanceDurationUnit = 'unlimited' | 'years' | 'months'

// 手当
export interface Allowance {
  id: string // 一意のID (リスト表示などで使用)
  name: string // 手当名 (例: 住宅手当)
  amount: number // 金額 or 係数
  type: AllowanceType
  durationUnit: AllowanceDurationUnit
  durationValue: number | null // 期限の数値 (例: 5年)
}

// 固定残業代
export interface FixedOvertime {
  amount: number // 固定残業代の金額
  hours: number // 固定残業時間
}

// シナリオ (ユーザーが入力する条件セット)
export interface Scenario {
  id: string // 一意のID
  name: string // シナリオ名 (例: A社オファー)
  baseSalary: number // 基本給 (月額)
  allowances: Allowance[] // 手当リスト
  hasFixedOvertime: boolean // 固定残業代の有無
  overtime: FixedOvertime
  salaryGrowthRate: number // 年間給与成長率 (%)
  createdAt: string // 作成日時 (ISO文字列)
}
