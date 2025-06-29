/**
 * @file src/main/index.ts
 * @description Mainプロセス (バックエンドロジック)
 */
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import fs from 'node:fs'
import crypto from 'node:crypto'
import type { GraphViewSettings, PredictionResult, Scenario, TaxSchema } from '../types/miraishi'
import { scenarioSchema } from './lib/validators'
import { calculatePrediction } from './lib/calculator'

// -----------------------------------------------------------------------------
// 初期化
// -----------------------------------------------------------------------------

const store = new Store<{ scenarios: Scenario[] }>({
  defaults: {
    scenarios: []
  }
})

// 🔽 ----- 初期計算結果を保持するキャッシュを追加 ----- 🔽
const initialCalculationCache = new Map<string, PredictionResult>()

const taxSchemaPath = join(__dirname, '../../resources/schema/tax_schema.json')
let taxSchema: TaxSchema | null = null
try {
  const rawData = fs.readFileSync(taxSchemaPath, 'utf-8')
  taxSchema = JSON.parse(rawData)
  console.log('Tax schema loaded successfully.')
} catch (error) {
  console.error('Failed to load tax schema:', error)
  app.quit()
}

// -----------------------------------------------------------------------------
// ウィンドウ作成
// -----------------------------------------------------------------------------

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', (): void => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// -----------------------------------------------------------------------------
// アプリケーションライフサイクル
// -----------------------------------------------------------------------------

app.whenReady().then((): void => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window): void => {
    optimizer.watchWindowShortcuts(window)
  })

  // 🔽 ----- 投機的バックグラウンド計算のロジック ----- 🔽
  const scenarios = store.get('scenarios', [])
  if (scenarios.length > 0 && taxSchema) {
    const firstScenario = scenarios[0]
    const defaultSettings: GraphViewSettings = {
      predictionPeriod: 10,
      averageOvertimeHours: 0,
      displayItem: ['netAnnual']
    }

    console.log(`Speculative calculation started for scenario: ${firstScenario.title}`)
    try {
      const result = calculatePrediction(
        { scenario: firstScenario, settings: defaultSettings },
        taxSchema
      )
      initialCalculationCache.set(firstScenario.id, result)
      console.log(
        `Speculative calculation finished and cached for scenario: ${firstScenario.title}`
      )
    } catch (e) {
      console.error('Speculative calculation failed:', e)
    }
  }

  // -----------------------------------------------------------------------------
  // IPCハンドラ
  // -----------------------------------------------------------------------------

  ipcMain.handle('get-all-scenarios', (): Scenario[] => {
    return store.get('scenarios', [])
  })

  ipcMain.handle(
    'create-scenario',
    (_, newScenarioData: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date()
        const newScenario: Scenario = {
          ...newScenarioData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        }

        scenarioSchema.parse(newScenario)

        const scenarios = store.get('scenarios', [])
        scenarios.push(newScenario)
        store.set('scenarios', scenarios)
        return { success: true, scenario: newScenario }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  )

  ipcMain.handle('update-scenario', (_, receivedScenario: Scenario) => {
    try {
      const scenarioToValidate: Scenario = {
        ...receivedScenario,
        createdAt: new Date(receivedScenario.createdAt),
        updatedAt: new Date()
      }

      scenarioSchema.parse(scenarioToValidate)

      const scenarios = store.get('scenarios', [])
      const index = scenarios.findIndex((s) => s.id === scenarioToValidate.id)
      if (index === -1) {
        throw new Error('Scenario not found')
      }
      scenarios[index] = scenarioToValidate
      store.set('scenarios', scenarios)
      return { success: true, scenario: scenarioToValidate }
    } catch (error) {
      console.error('Failed to update scenario:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unknown error occurred' }
    }
  })

  ipcMain.handle('delete-scenario', (_, scenarioId: string) => {
    try {
      const scenarios = store.get('scenarios', [])
      const filteredScenarios = scenarios.filter((s) => s.id !== scenarioId)

      if (scenarios.length === filteredScenarios.length) {
        throw new Error('Scenario not found for deletion')
      }

      store.set('scenarios', filteredScenarios)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete scenario:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unknown error occurred' }
    }
  })

  ipcMain.handle(
    'calculate-prediction',
    (
      _,
      { scenario, settings }: { scenario: Scenario; settings: GraphViewSettings }
    ): PredictionResult | { success: false; error: string } => {
      // 🔽 ----- キャッシュを確認し、あればそれを返すロジック ----- 🔽
      if (initialCalculationCache.has(scenario.id)) {
        console.log(`Returning cached result for scenario: ${scenario.title}`)
        const cachedResult = initialCalculationCache.get(scenario.id)!
        initialCalculationCache.delete(scenario.id) // キャッシュは一度使ったら削除
        return cachedResult
      }

      try {
        if (!taxSchema) {
          throw new Error('Tax schema is not loaded.')
        }
        const result = calculatePrediction({ scenario, settings }, taxSchema)
        return result
      } catch (error) {
        console.error('Failed to calculate prediction:', error)
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: 'An unknown error occurred during calculation' }
      }
    }
  )

  createWindow()

  app.on('activate', function (): void {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
