export interface Income {
  salary: number // 給与収入
  pension: number // 年金収入
  other: number // その他所得
}

export interface Deduction {
  socialInsurance: number // 社会保険料
  lifeInsurance: number // 生命保険料控除
  earthquakeInsurance: number // 地震保険料控除
  ideco: number // iDeCo
}

export interface Person {
  age: number
  income: Income
  deduction: Deduction
}

export interface Dependent {
  id: string
  age: number
  type: 'general' | 'specific' | 'elderly' | 'other' // 扶養区分
}

export interface Scenario {
  id: string
  name: string
  mainPerson: Person
  spouse: Person // 配偶者を追加
  dependents: Dependent[]
}
