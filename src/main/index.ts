/**
 * @file src/main/index.ts
 * @description Mainプロセス (バックエンドロジック)
 */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import fs from 'node:fs'
import crypto from 'node:crypto'
import type { Scenario, TaxSchema, PredictionResult } from '../types/miraishi'
import { scenarioSchema } from './lib/validators'
import { calculatePrediction } from './lib/calculator'

const store = new Store<{ scenarios: Scenario[] }>({
  defaults: {
    scenarios: []
  }
})

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

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC実装
  ipcMain.handle('get-all-scenarios', () => {
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
      // 🔽 ----- ここから修正 ----- 🔽
      // IPC通信で文字列に変換された日付をDateオブジェクトに戻す
      const scenarioToValidate: Scenario = {
        ...receivedScenario,
        createdAt: new Date(receivedScenario.createdAt),
        updatedAt: new Date() // 更新日時は常に新しい日時に
      }

      // Zodでバリデーション
      scenarioSchema.parse(scenarioToValidate)

      const scenarios = store.get('scenarios', [])
      const index = scenarios.findIndex((s) => s.id === scenarioToValidate.id)
      if (index === -1) {
        throw new Error('Scenario not found')
      }
      scenarios[index] = scenarioToValidate
      store.set('scenarios', scenarios)
      return { success: true, scenario: scenarioToValidate }
      // 🔼 ----- ここまで修正 ----- 🔼
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
    (_, scenario: Scenario): PredictionResult | { success: false; error: string } => {
      try {
        if (!taxSchema) {
          throw new Error('Tax schema is not loaded.')
        }
        // ここでは予測期間を10年で固定します
        const result = calculatePrediction(scenario, taxSchema, 10)
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

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
