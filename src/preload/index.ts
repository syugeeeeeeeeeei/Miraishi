import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  GraphViewSettings,
  PredictionResult,
  Scenario,
  SchemaValidationReport,
  TaxSchema,
  TaxSchemaDiffSummary,
  TaxSchemaSnapshot
} from '../types/miraishi'

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
  getTaxSchema: (): Promise<{ success: boolean; taxSchema?: TaxSchema; error?: string }> =>
    ipcRenderer.invoke('get-tax-schema'),
  previewTaxSchema: (
    yamlText: string
  ): Promise<{ success: boolean; report?: SchemaValidationReport; error?: string }> =>
    ipcRenderer.invoke('preview-tax-schema', yamlText),
  applyTaxSchema: (payload: {
    yamlText: string
    note?: string
  }): Promise<{ success: boolean; report?: SchemaValidationReport; taxSchema?: TaxSchema; error?: string }> =>
    ipcRenderer.invoke('apply-tax-schema', payload),
  updateTaxSchema: (
    nextTaxSchema: TaxSchema
  ): Promise<{ success: boolean; taxSchema?: TaxSchema; report?: SchemaValidationReport; error?: string }> =>
    ipcRenderer.invoke('update-tax-schema', nextTaxSchema),
  listTaxSchemaHistory: (): Promise<{
    success: boolean
    activeSnapshotId?: string | null
    snapshots?: TaxSchemaSnapshot[]
    error?: string
  }> => ipcRenderer.invoke('list-tax-schema-history'),
  restoreTaxSchema: (
    snapshotId: string
  ): Promise<{ success: boolean; taxSchema?: TaxSchema; error?: string }> =>
    ipcRenderer.invoke('restore-tax-schema', snapshotId),
  diffTaxSchema: (
    payload: {
      nextYamlText: string
    }
  ): Promise<{ success: boolean; diff?: TaxSchemaDiffSummary; error?: string }> =>
    ipcRenderer.invoke('diff-tax-schema', payload),
  calculatePrediction: ({
    scenario,
    settings,
    taxSchemaOverride
  }: {
    scenario: Scenario
    settings: GraphViewSettings
    taxSchemaOverride?: TaxSchema
  }): Promise<PredictionResult | { success: false; error?: string }> =>
    ipcRenderer.invoke('calculate-prediction', { scenario, settings, taxSchemaOverride })
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
