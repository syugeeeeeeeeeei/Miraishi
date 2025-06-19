import { ipcMain } from 'electron'
import Store from 'electron-store'
import type { Scenario } from '../types/scenario.js' // ★ パス修正

// electron-storeのインスタンスを作成
const store = new Store({
  name: 'miraishi-data', // 保存されるファイル名
  defaults: {
    scenarios: [] // デフォルト値
  }
})

export function setupIpcHandlers(): void {
  // シナリオを保存する処理
  ipcMain.handle('save-scenarios', (_, scenarios: Scenario[]) => {
    try {
      store.set('scenarios', scenarios)
      return { success: true }
    } catch (error) {
      console.error(error)
      return { success: false, error: 'Failed to save scenarios.' }
    }
  })

  // シナリオを読み込む処理
  ipcMain.handle('load-scenarios', () => {
    try {
      const scenarios = store.get('scenarios', []) as Scenario[]
      return { success: true, data: scenarios }
    } catch (error) {
      console.error(error)
      return { success: false, error: 'Failed to load scenarios.' }
    }
  })
}
