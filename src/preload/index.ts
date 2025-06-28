import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Scenario, PredictionResult, GraphViewSettings } from '../types/miraishi'

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
  calculatePrediction: ({
    scenario,
    settings
  }: {
    scenario: Scenario
    settings: GraphViewSettings
  }): Promise<PredictionResult | { success: false; error?: string }> =>
    ipcRenderer.invoke('calculate-prediction', { scenario, settings })
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
