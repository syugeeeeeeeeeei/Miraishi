import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Scenario } from '../types/miraishi'
import type { PredictionResult } from '@myTypes/miraishi'

// Rendererプロセスに公開するAPIを定義
export const api = {
  getAllScenarios: (): Promise<Scenario[]> => ipcRenderer.invoke('get-all-scenarios'),
  createScenario: (
    newScenarioData: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; scenario?: Scenario; error?: string }> =>
    ipcRenderer.invoke('create-scenario', newScenarioData),
  updateScenario: (
    updatedScenario: Scenario
  ): Promise<{ success: boolean; scenario?: Scenario; error?: string }> =>
    ipcRenderer.invoke('update-scenario', updatedScenario),
  deleteScenario: (scenarioId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('delete-scenario', scenarioId),
  calculatePrediction: (
    scenario: Scenario
  ): Promise<PredictionResult | { success: false; error?: string }> =>
    ipcRenderer.invoke('calculate-prediction', scenario)
}

// Use `contextBridge` to expose Electron APIs to the renderer process.
// Note: The `api` object will be available on `window.api`.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api) // ここで定義したapiオブジェクトを公開
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
