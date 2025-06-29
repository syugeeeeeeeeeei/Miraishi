/**
 * @file src/renderer/src/store/atoms.ts
 * @description Jotaiを使用したグローバル状態管理のAtom定義
 */
import { atom } from 'jotai'
import type { Scenario, PredictionResult, GraphViewSettings } from '@myTypes/miraishi'

// --- データ関連のAtom ---

export const scenariosAtom = atom<Scenario[]>([])

export const activeScenarioIdsAtom = atom<string[]>([])

export const activeScenariosAtom = atom<Scenario[]>((get) => {
  const scenarios = get(scenariosAtom)
  const activeIds = get(activeScenarioIdsAtom)
  return scenarios.filter((s) => activeIds.includes(s.id))
})

export const loadScenariosAtom = atom(null, async (_get, set) => {
  try {
    const scenarios = await window.api.getAllScenarios()
    set(scenariosAtom, scenarios)
  } catch (error) {
    console.error('Failed to load scenarios:', error)
  }
})

export const createScenarioAtom = atom(null, async (_get, set) => {
  try {
    const newScenarioData: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'> = {
      title: '新しいシナリオ',
      initialBasicSalary: 300000,
      allowances: [],
      overtime: {
        fixedOvertime: { enabled: false, amount: 0, hours: 0 },
        variableOvertime: { enabled: true, calculationMethod: 'basic' }
      },
      annualBonus: 0,
      probation: {
        enabled: false,
        durationMonths: 3,
        basicSalary: 280000,
        fixedOvertime: 0
      },
      salaryGrowthRate: 2.5,
      deductions: {
        dependents: { hasSpouse: false, numberOfDependents: 0 },
        otherDeductions: []
      }
    }
    const result = await window.api.createScenario(newScenarioData)
    if (result.success && result.scenario) {
      await set(loadScenariosAtom)
      set(activeScenarioIdsAtom, [result.scenario.id])
    } else {
      console.error('Failed to create scenario:', result.error)
    }
  } catch (error) {
    console.error('An unexpected error occurred while creating scenario:', error)
  }
})

export const updateScenarioAtom = atom(null, async (_get, set, updatedScenario: Scenario) => {
  try {
    const result = await window.api.updateScenario(updatedScenario)

    if (result.success) {
      await set(loadScenariosAtom)
    } else {
      console.error('Failed to update scenario:', result.error)
    }
  } catch (error) {
    console.error('An unexpected error occurred while updating scenario:', error)
  }
})

export const deleteScenarioAtom = atom(null, async (get, set, scenarioId: string) => {
  try {
    const result = await window.api.deleteScenario(scenarioId)

    if (result.success) {
      set(
        activeScenarioIdsAtom,
        get(activeScenarioIdsAtom).filter((id) => id !== scenarioId)
      )
      await set(loadScenariosAtom)
    } else {
      console.error('Failed to delete scenario:', result.error)
    }
  } catch (error) {
    console.error('An unexpected error occurred while deleting scenario:', error)
  }
})

// --- UI状態・計算関連のAtom ---

export const isControlPanelOpenAtom = atom(false)
export const isGraphViewVisibleAtom = atom(false)

/**
 * グラフビューの表示設定
 */
export const graphViewSettingsAtom = atom<GraphViewSettings>({
  predictionPeriod: 10,
  averageOvertimeHours: 0,
  displayItem: ['netAnnual']
})

/**
 * 複数シナリオの計算結果を保持するAtom
 * { scenarioId: string, result: PredictionResult } の配列
 */
export const predictionResultsAtom = atom<{ scenarioId: string; result: PredictionResult }[]>([])

/**
 * 選択中の全シナリオの計算を実行・更新するAtom
 */
export const calculatePredictionsAtom = atom(null, async (get, set) => {
  const scenarios = get(activeScenariosAtom)
  const settings = get(graphViewSettingsAtom)

  if (scenarios.length === 0) {
    set(predictionResultsAtom, [])
    return
  }

  const results = await Promise.all(
    scenarios.map(async (scenario) => {
      const result = await window.api.calculatePrediction({
        scenario,
        settings
      })
      if ('details' in result) {
        return { scenarioId: scenario.id, result }
      }
      return null
    })
  )

  set(
    predictionResultsAtom,
    results.filter((r) => r !== null) as { scenarioId: string; result: PredictionResult }[]
  )
})

// 🔽 追加：検索クエリを保持するアトム
export const searchQueryAtom = atom<string>('')

// 🔽 追加：検索クエリに基づいてフィルタリングされたシナリオのリストを返す派生アトム
export const filteredScenariosAtom = atom<Scenario[]>((get) => {
  const allScenarios = get(scenariosAtom)
  const query = get(searchQueryAtom).toLowerCase() // 検索クエリを小文字に変換

  if (!query) {
    // 検索クエリが空の場合は全てのシナリオを返す
    return allScenarios
  }

  // シナリオのタイトルが検索クエリを部分一致で含むものをフィルタリング
  return allScenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(query)
  )
})
