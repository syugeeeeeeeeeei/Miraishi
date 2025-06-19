import type { Scenario } from '../../../types/scenario' // ★ パス修正

/**
 * 複数のシナリオを保存する
 * @param scenarios 保存するシナリオの配列
 * @returns 成功したかどうかのオブジェクト
 */
export async function saveScenarios(
  scenarios: Scenario[]
): Promise<{ success: boolean; error?: string }> {
  // preloadで公開したAPIを呼び出す
  return window.api.saveScenarios(scenarios)
}

/**
 * 保存されているすべてのシナリオを読み込む
 * @returns 成功情報とシナリオデータのオブジェクト
 */
export async function loadScenarios(): Promise<{
  success: boolean
  data?: Scenario[]
  error?: string
}> {
  return window.api.loadScenarios()
}
