// シミュレーション計算への入力
export interface CalculationInput {
  grossYearlySalary: number // 年間額面給与
  dependentsCount: number // 扶養家族の人数
  // iDeCoなど、他の控除項目もここに追加可能
}

// 税金・社会保険料の内訳
export interface DeductionDetails {
  healthInsurance: number // 健康保険料
  pension: number // 厚生年金保険料
  employmentInsurance: number // 雇用保険料
  incomeTax: number // 所得税
  residentTax: number // 住民税
  total: number // 控除合計額
}

// ある時点での給与詳細
export interface SalaryDetails {
  year: number // シミュレーション開始からの年数
  monthlyGross: number // 月額額面
  yearlyGross: number // 年額額面
  monthlyNet: number // 月額手取り
  yearlyNet: number // 年額手取り
  yearlyDeductions: DeductionDetails // 年間の控除内訳
}
