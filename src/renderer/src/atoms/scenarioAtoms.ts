import { atom } from 'jotai'
import type { Scenario } from '../../../types/scenario' // 型定義をインポート
import { v4 as uuidv4 } from 'uuid'

/**
 * 新しい空のシナリオを生成するための初期値。
 * 「新規作成」ボタンが押されたときなどに利用します。
 */
const createDefaultScenario = (): Scenario => ({
  id: uuidv4(),
  name: '新しいシナリオ',
  baseSalary: 300000, // 新卒の初任給の仮置き
  allowances: [],
  hasFixedOvertime: false,
  fixedOvertime: { amount: 0, hours: 0 },
  salaryGrowthRate: 3.0, // 仮の昇給率
  createdAt: new Date().toISOString()
})

/**
 * 現在アクティブになっている（編集中の）シナリオの状態を保持するatom。
 * 初期値として、空のシナリオをセットしておきます。
 */
export const activeScenarioAtom = atom<Scenario>(createDefaultScenario())

/**
 * 保存されているすべてのシナリオのリストを保持するatom。
 * アプリケーション起動時に、後ほど作成する`electron-store`のロジックから
 * 読み込んだデータで初期化することを想定しています。
 */
export const savedScenariosAtom = atom<Scenario[]>([])
