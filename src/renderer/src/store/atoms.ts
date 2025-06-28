/**
 * @file src/renderer/src/store/atoms.ts
 * @description Jotaiを使用したグローバル状態管理のAtom定義
 */
import { atom } from 'jotai'
import type { Scenario, PredictionResult } from '@myTypes/miraishi'

// --- データ関連のAtom ---

export const scenariosAtom = atom<Scenario[]>([])

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
      salaryGrowthRate: 2.5,
      deductions: {
        dependents: { hasSpouse: false, numberOfDependents: 0 },
        otherDeductions: []
      }
    }
    const result = await window.api.createScenario(newScenarioData)
    if (result.success) {
      await set(loadScenariosAtom)
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
      if (get(activeScenarioIdAtom) === scenarioId) {
        set(activeScenarioIdAtom, null)
      }
      await set(loadScenariosAtom)
    } else {
      console.error('Failed to delete scenario:', result.error)
    }
  } catch (error) {
    console.error('An unexpected error occurred while deleting scenario:', error)
  }
})

// --- UI状態関連のAtom ---

export const isControlPanelOpenAtom = atom(true) // デフォルトは開いた状態に

// 🔽 ----- ここから修正 ----- 🔽
/**
 * グラフドロワーの表示状態を管理するAtom
 */
export const isGraphViewVisibleAtom = atom(false)

/**
 * 計算結果をグローバルに保持するAtom
 */
export const predictionResultAtom = atom<PredictionResult | null>(null)
// 🔼 ----- ここまで修正 ----- 🔼

export const activeScenarioIdAtom = atom<string | null>(null)
