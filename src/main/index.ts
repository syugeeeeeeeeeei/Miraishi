/**
 * @file src/main/index.ts
 * @description Mainプロセス (バックエンドロジック)
 */
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { parse as parseYaml, parseDocument } from 'yaml'
import type {
  GraphViewSettings,
  PredictionResult,
  Scenario,
  ScenarioComparisonPdfExportRequest,
  ScenarioComparisonPdfExportResponse,
  SchemaValidationReport,
  TaxSchema,
  TaxSchemaDiffSummary,
  TaxSchemaSnapshot,
  TaxSchemaState,
  TaxSchemaV2
} from '../types/miraishi'
import {
  normalizeTaxSchema,
  parseTaxSchemaUnknown,
  scenarioSchema,
  taxSchemaSchema,
  taxSchemaV2Schema,
  validateTaxSchemaV2Semantics
} from './lib/validators'
import { calculatePrediction } from './lib/calculator'
import { compileTaxSchemaV2 } from './lib/taxSchemaEngine'
import { diffAsJsonPointers } from './lib/schemaDiff'
import {
  buildScenarioComparisonDefaultFileName,
  buildScenarioComparisonReportHtml
} from './lib/scenarioComparisonPdf'

// -----------------------------------------------------------------------------
// 初期化
// -----------------------------------------------------------------------------

type AppStore = {
  scenarios: Scenario[]
  taxSchema?: TaxSchema
  taxSchemaState?: TaxSchemaState
}

const store = new Store<AppStore>({
  defaults: {
    scenarios: []
  }
})

const initialCalculationCache = new Map<string, PredictionResult>()
const HISTORY_LIMIT = 100
const localRequire = createRequire(__filename)

const taxSchemaPath = join(__dirname, '../../resources/schema/tax_schema.yaml')
const legacyTaxSchemaPath = join(__dirname, '../../resources/schema/tax_schema.json')

const createSchemaHash = (schema: TaxSchemaV2): string => {
  return crypto.createHash('sha256').update(JSON.stringify(schema)).digest('hex')
}

const createSnapshot = (schema: TaxSchemaV2, note: string): TaxSchemaSnapshot => ({
  id: crypto.randomUUID(),
  hash: createSchemaHash(schema),
  schemaVersion: schema.schemaVersion,
  lawVersion: schema.version,
  createdAt: new Date().toISOString(),
  note,
  schema
})

const parseStoredTaxSchemaState = (raw: unknown): TaxSchemaState | null => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const maybe = raw as TaxSchemaState
  if (!Array.isArray(maybe.snapshots)) {
    return null
  }

  const snapshots: TaxSchemaSnapshot[] = []
  for (const snapshot of maybe.snapshots) {
    if (!snapshot || typeof snapshot !== 'object') {
      continue
    }
    const parsedSchema = taxSchemaV2Schema.safeParse((snapshot as TaxSchemaSnapshot).schema)
    if (!parsedSchema.success) {
      continue
    }
    const validatedSchema = normalizeTaxSchema(parsedSchema.data as TaxSchemaV2)
    snapshots.push({
      id: String((snapshot as TaxSchemaSnapshot).id ?? crypto.randomUUID()),
      hash: String((snapshot as TaxSchemaSnapshot).hash ?? createSchemaHash(validatedSchema)),
      schemaVersion: String((snapshot as TaxSchemaSnapshot).schemaVersion ?? validatedSchema.schemaVersion),
      lawVersion: String((snapshot as TaxSchemaSnapshot).lawVersion ?? validatedSchema.version),
      createdAt: String((snapshot as TaxSchemaSnapshot).createdAt ?? new Date().toISOString()),
      note: String((snapshot as TaxSchemaSnapshot).note ?? ''),
      schema: validatedSchema
    })
  }

  if (snapshots.length === 0) {
    return null
  }

  const activeSnapshotId =
    typeof maybe.activeSnapshotId === 'string' && snapshots.some((s) => s.id === maybe.activeSnapshotId)
      ? maybe.activeSnapshotId
      : snapshots[snapshots.length - 1].id

  const legacyBackups = Array.isArray(maybe.legacyBackups)
    ? maybe.legacyBackups.filter((item) => taxSchemaSchema.safeParse(item).success)
    : []

  return {
    activeSnapshotId,
    snapshots,
    legacyBackups
  }
}

const trimHistory = (state: TaxSchemaState): TaxSchemaState => {
  if (state.snapshots.length <= HISTORY_LIMIT) {
    return state
  }

  const snapshots = state.snapshots.slice(state.snapshots.length - HISTORY_LIMIT)
  const activeStillExists = snapshots.some((s) => s.id === state.activeSnapshotId)

  return {
    ...state,
    snapshots,
    activeSnapshotId: activeStillExists ? state.activeSnapshotId : snapshots[snapshots.length - 1].id
  }
}

const loadBundledTaxSchema = (): TaxSchemaV2 => {
  const candidatePaths = [taxSchemaPath, legacyTaxSchemaPath]
  let lastError: unknown = null

  for (const candidatePath of candidatePaths) {
    if (!fs.existsSync(candidatePath)) {
      continue
    }

    try {
      const rawData = fs.readFileSync(candidatePath, 'utf-8')
      const parsed =
        candidatePath.endsWith('.yaml') || candidatePath.endsWith('.yml')
          ? parseYaml(rawData)
          : JSON.parse(rawData)
      const parsedSchema = parseTaxSchemaUnknown(parsed)
      return normalizeTaxSchema(parsedSchema)
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }
  throw new Error('Bundled tax schema file was not found.')
}

const normalizeStoredScenarios = (): Scenario[] => {
  const scenarios = store.get('scenarios', [])
  const normalized: Scenario[] = []

  scenarios.forEach((scenario) => {
    const parsed = scenarioSchema.safeParse(scenario)
    if (parsed.success) {
      normalized.push(parsed.data as Scenario)
    }
  })

  if (normalized.length !== scenarios.length) {
    console.warn('Some invalid scenarios were dropped during normalization.')
  }

  if (JSON.stringify(scenarios) !== JSON.stringify(normalized)) {
    store.set('scenarios', normalized)
  }

  return normalized
}

const validateAndCompile = (
  schema: TaxSchemaV2
): { errors: string[]; warnings: string[]; compiled?: ReturnType<typeof compileTaxSchemaV2> } => {
  const semantic = validateTaxSchemaV2Semantics(schema)
  if (semantic.errors.length > 0) {
    return { errors: semantic.errors, warnings: semantic.warnings }
  }

  try {
    const compiled = compileTaxSchemaV2(schema)
    return { errors: [], warnings: semantic.warnings, compiled }
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'Failed to compile schema formula.'],
      warnings: semantic.warnings
    }
  }
}

const buildValidationReport = (
  normalizedSchema: TaxSchemaV2,
  currentSchema: TaxSchemaV2
): SchemaValidationReport => {
  const validation = validateAndCompile(normalizedSchema)
  const diffSummary = diffAsJsonPointers(currentSchema, normalizedSchema)

  return {
    isValid: validation.errors.length === 0,
    errors: validation.errors,
    warnings: validation.warnings,
    normalizedSchema,
    diffSummary
  }
}

const parseYamlSchemaToReport = (
  yamlText: string,
  currentSchema: TaxSchemaV2
): SchemaValidationReport => {
  const doc = parseDocument(yamlText)
  if (doc.errors.length > 0) {
    return {
      isValid: false,
      errors: doc.errors.map((error) => `YAML構文エラー: ${error.message}`),
      warnings: []
    }
  }

  const parsedUnknown = doc.toJS()
  let parsedSchema: TaxSchema

  try {
    parsedSchema = parseTaxSchemaUnknown(parsedUnknown)
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'スキーマの構造が不正です。'],
      warnings: []
    }
  }

  const normalized = normalizeTaxSchema(parsedSchema)
  return buildValidationReport(normalized, currentSchema)
}

let taxSchemaState: TaxSchemaState
let activeTaxSchema: TaxSchemaV2
let compiledActiveTaxSchema: ReturnType<typeof compileTaxSchemaV2>

try {
  const bundledSchema = loadBundledTaxSchema()
  const storedStateRaw = store.get('taxSchemaState')
  const storedState = parseStoredTaxSchemaState(storedStateRaw)

  if (storedState) {
    taxSchemaState = trimHistory(storedState)
  } else {
    const storedLegacyRaw = store.get('taxSchema')
    if (storedLegacyRaw) {
      const parsedLegacy = parseTaxSchemaUnknown(storedLegacyRaw)
      const normalizedLegacy = normalizeTaxSchema(parsedLegacy)
      taxSchemaState = {
        activeSnapshotId: null,
        snapshots: [createSnapshot(normalizedLegacy, 'legacy import')],
        legacyBackups: parsedLegacy && !('schemaVersion' in parsedLegacy) ? [parsedLegacy] : []
      }
    } else {
      taxSchemaState = {
        activeSnapshotId: null,
        snapshots: [createSnapshot(bundledSchema, 'bundled default')],
        legacyBackups: []
      }
    }
  }

  const activeSnapshot =
    taxSchemaState.snapshots.find((snapshot) => snapshot.id === taxSchemaState.activeSnapshotId) ??
    taxSchemaState.snapshots[taxSchemaState.snapshots.length - 1]

  taxSchemaState.activeSnapshotId = activeSnapshot.id
  activeTaxSchema = activeSnapshot.schema

  const compiled = validateAndCompile(activeTaxSchema)
  if (compiled.errors.length > 0 || !compiled.compiled) {
    throw new Error(compiled.errors.join('\n'))
  }
  compiledActiveTaxSchema = compiled.compiled

  store.set('taxSchemaState', taxSchemaState)
  store.set('taxSchema', activeTaxSchema)

  normalizeStoredScenarios()
  console.log('Tax schema state loaded successfully.')
} catch (error) {
  console.error('Failed to initialize tax schema state:', error)
  app.quit()
}

const applyNormalizedSchema = (schema: TaxSchemaV2, note: string): TaxSchemaSnapshot => {
  const validation = validateAndCompile(schema)
  if (validation.errors.length > 0 || !validation.compiled) {
    throw new Error(validation.errors.join('\n'))
  }

  const snapshot = createSnapshot(schema, note)
  taxSchemaState.snapshots.push(snapshot)
  taxSchemaState.activeSnapshotId = snapshot.id
  taxSchemaState = trimHistory(taxSchemaState)

  activeTaxSchema = schema
  compiledActiveTaxSchema = validation.compiled

  store.set('taxSchemaState', taxSchemaState)
  store.set('taxSchema', activeTaxSchema)

  initialCalculationCache.clear()

  return snapshot
}

const normalizeScenarioComparisonExportRequest = (
  payload: ScenarioComparisonPdfExportRequest
): ScenarioComparisonPdfExportRequest => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('エクスポート設定が不正です。')
  }

  const scenarioIds = Array.from(
    new Set((payload.scenarioIds ?? []).filter((id): id is string => typeof id === 'string' && id.length > 0))
  )
  if (scenarioIds.length < 2) {
    throw new Error('比較対象シナリオは2件以上選択してください。')
  }

  const untilYear = Math.trunc(payload.untilYear)
  if (!Number.isFinite(untilYear) || untilYear < 1 || untilYear > 50) {
    throw new Error('比較対象年は1〜50の範囲で指定してください。')
  }

  const averageOvertimeHours = Number(payload.averageOvertimeHours)
  if (!Number.isFinite(averageOvertimeHours) || averageOvertimeHours < 0 || averageOvertimeHours > 500) {
    throw new Error('月平均残業時間の指定が不正です。')
  }

  const includeSections = payload.includeSections
  if (!includeSections || typeof includeSections !== 'object') {
    throw new Error('出力セクション設定が不正です。')
  }

  const normalizedSections = {
    conditions: Boolean(includeSections.conditions),
    yearlyComparison: Boolean(includeSections.yearlyComparison),
    growthSummary: Boolean(includeSections.growthSummary),
    scenarioDetails: Boolean(includeSections.scenarioDetails),
    taxMeta: Boolean(includeSections.taxMeta)
  }

  if (!Object.values(normalizedSections).some(Boolean)) {
    throw new Error('出力セクションを1つ以上選択してください。')
  }

  return {
    scenarioIds,
    untilYear,
    averageOvertimeHours,
    includeSections: normalizedSections
  }
}

const createPdfBufferFromHtml = async (html: string): Promise<Buffer> => {
  const printWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 1810,
    webPreferences: {
      sandbox: true,
      contextIsolation: true
    }
  })

  const tempHtmlPath = join(
    app.getPath('temp'),
    `miraishi-scenario-comparison-${Date.now()}-${crypto.randomUUID()}.html`
  )

  try {
    await fs.promises.writeFile(tempHtmlPath, html, 'utf8')
    await printWindow.loadFile(tempHtmlPath)
    await printWindow.webContents.executeJavaScript(
      "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true"
    )
    return await printWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: 'A4'
    })
  } finally {
    await fs.promises.unlink(tempHtmlPath).catch(() => undefined)
    if (!printWindow.isDestroyed()) {
      printWindow.destroy()
    }
  }
}

const buildEmbeddedFontFaceCss = (): string => {
  const fontDefinitions: Array<{ family: string; weight: number; modulePath: string }> = [
    {
      family: 'Zen Maru Gothic',
      weight: 400,
      modulePath: '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-400-normal.woff2'
    },
    {
      family: 'Zen Maru Gothic',
      weight: 700,
      modulePath: '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-700-normal.woff2'
    },
    {
      family: 'M PLUS Rounded 1c',
      weight: 400,
      modulePath: '@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-japanese-400-normal.woff2'
    },
    {
      family: 'M PLUS Rounded 1c',
      weight: 700,
      modulePath: '@fontsource/m-plus-rounded-1c/files/m-plus-rounded-1c-japanese-700-normal.woff2'
    }
  ]

  const chunks: string[] = []

  fontDefinitions.forEach((font) => {
    try {
      const resolvedPath = localRequire.resolve(font.modulePath)
      const fontBuffer = fs.readFileSync(resolvedPath)
      const base64 = fontBuffer.toString('base64')
      chunks.push(`
@font-face {
  font-family: '${font.family}';
  font-style: normal;
  font-weight: ${font.weight};
  font-display: swap;
  src: url(data:font/woff2;base64,${base64}) format('woff2');
}
      `)
    } catch {
      // フォント埋め込み失敗時はシステムフォントへフォールバック
    }
  })

  return chunks.join('\n')
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

  // 投機的バックグラウンド計算
  const scenarios = store.get('scenarios', [])
  if (scenarios.length > 0) {
    const firstScenario = scenarioSchema.parse(scenarios[0])
    const defaultSettings: GraphViewSettings = {
      predictionPeriod: 10,
      averageOvertimeHours: 0,
      displayItem: ['netAnnual']
    }
    const settingsString = JSON.stringify({ settings: defaultSettings, schema: activeTaxSchema })
    const settingsHash = crypto.createHash('sha256').update(settingsString).digest('hex')
    const cacheKey = `${firstScenario.id}-${settingsHash}`

    try {
      const result = calculatePrediction(
        { scenario: firstScenario, settings: defaultSettings },
        compiledActiveTaxSchema
      )
      initialCalculationCache.set(cacheKey, result)
    } catch (e) {
      console.error('Speculative calculation failed:', e)
    }
  }

  // ---------------------------------------------------------------------------
  // IPCハンドラ
  // ---------------------------------------------------------------------------

  ipcMain.handle('get-all-scenarios', (): Scenario[] => {
    return normalizeStoredScenarios()
  })

  ipcMain.handle(
    'create-scenario',
    (_, newScenarioData: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date()
        const parsed = scenarioSchema.parse({
          ...newScenarioData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        })

        const scenarios = store.get('scenarios', [])
        scenarios.push(parsed)
        store.set('scenarios', scenarios)

        return { success: true, scenario: parsed }
      } catch (error) {
        if (error instanceof Error) return { success: false, error: error.message }
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  )

  ipcMain.handle('update-scenario', (_, receivedScenario: Scenario) => {
    try {
      const scenarioToValidate = scenarioSchema.parse({
        ...receivedScenario,
        createdAt: new Date(receivedScenario.createdAt),
        updatedAt: new Date()
      })

      const scenarios = store.get('scenarios', [])
      const index = scenarios.findIndex((s) => s.id === scenarioToValidate.id)
      if (index === -1) throw new Error('Scenario not found')

      for (const key of initialCalculationCache.keys()) {
        if (key.startsWith(scenarioToValidate.id)) {
          initialCalculationCache.delete(key)
        }
      }

      scenarios[index] = scenarioToValidate
      store.set('scenarios', scenarios)
      return { success: true, scenario: scenarioToValidate }
    } catch (error) {
      console.error('Failed to update scenario:', error)
      if (error instanceof Error) return { success: false, error: error.message }
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

      for (const key of initialCalculationCache.keys()) {
        if (key.startsWith(`${scenarioId}-`)) {
          initialCalculationCache.delete(key)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to delete scenario:', error)
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  })

  const handleGetTaxSchema = (): { success: boolean; taxSchema?: TaxSchemaV2; error?: string } => {
    try {
      return { success: true, taxSchema: activeTaxSchema }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handlePreviewTaxSchema = (
    _,
    yamlText: string
  ): { success: boolean; report?: SchemaValidationReport; error?: string } => {
    try {
      const report = parseYamlSchemaToReport(yamlText, activeTaxSchema)
      return { success: true, report }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleApplyTaxSchema = (
    _,
    payload: { yamlText: string; note?: string }
  ): { success: boolean; report?: SchemaValidationReport; taxSchema?: TaxSchemaV2; error?: string } => {
    try {
      const currentSchema = activeTaxSchema
      const report = parseYamlSchemaToReport(payload.yamlText, activeTaxSchema)
      if (!report.isValid || !report.normalizedSchema) {
        return { success: false, report, error: report.errors.join('\n') || 'スキーマ検証に失敗しました。' }
      }

      const snapshot = applyNormalizedSchema(report.normalizedSchema, payload.note ?? 'applied from editor')
      const finalReport: SchemaValidationReport = {
        ...report,
        normalizedSchema: snapshot.schema,
        diffSummary: diffAsJsonPointers(currentSchema, snapshot.schema)
      }

      return {
        success: true,
        report: finalReport,
        taxSchema: snapshot.schema
      }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleUpdateTaxSchema = (
    _,
    nextTaxSchema: TaxSchema
  ): { success: boolean; taxSchema?: TaxSchemaV2; report?: SchemaValidationReport; error?: string } => {
    try {
      const parsed = parseTaxSchemaUnknown(nextTaxSchema)
      const normalized = normalizeTaxSchema(parsed)
      const report = buildValidationReport(normalized, activeTaxSchema)
      if (!report.isValid) {
        return { success: false, report, error: report.errors.join('\n') }
      }

      const snapshot = applyNormalizedSchema(normalized, 'legacy update-tax-schema')
      return { success: true, taxSchema: snapshot.schema, report }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleListTaxSchemaHistory = (): {
    success: boolean
    activeSnapshotId?: string | null
    snapshots?: TaxSchemaSnapshot[]
    error?: string
  } => {
    try {
      return {
        success: true,
        activeSnapshotId: taxSchemaState.activeSnapshotId,
        snapshots: taxSchemaState.snapshots
      }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleRestoreTaxSchema = (
    _,
    snapshotId: string
  ): { success: boolean; taxSchema?: TaxSchemaV2; error?: string } => {
    try {
      const snapshot = taxSchemaState.snapshots.find((s) => s.id === snapshotId)
      if (!snapshot) {
        throw new Error('Snapshot not found')
      }

      const validation = validateAndCompile(snapshot.schema)
      if (validation.errors.length > 0 || !validation.compiled) {
        throw new Error(validation.errors.join('\n'))
      }

      taxSchemaState.activeSnapshotId = snapshot.id
      activeTaxSchema = snapshot.schema
      compiledActiveTaxSchema = validation.compiled
      store.set('taxSchemaState', taxSchemaState)
      store.set('taxSchema', activeTaxSchema)
      initialCalculationCache.clear()

      return { success: true, taxSchema: snapshot.schema }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleDiffTaxSchema = (
    _,
    payload: { nextYamlText: string }
  ): { success: boolean; diff?: TaxSchemaDiffSummary; error?: string } => {
    try {
      const doc = parseDocument(payload.nextYamlText)
      if (doc.errors.length > 0) {
        throw new Error(doc.errors.map((error) => error.message).join('\n'))
      }
      const parsed = parseTaxSchemaUnknown(doc.toJS())
      const normalized = normalizeTaxSchema(parsed)
      const diff = diffAsJsonPointers(activeTaxSchema, normalized)
      return { success: true, diff }
    } catch (error) {
      if (error instanceof Error) return { success: false, error: error.message }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  const handleExportScenarioComparisonPdf = async (
    event,
    payload: ScenarioComparisonPdfExportRequest
  ): Promise<ScenarioComparisonPdfExportResponse> => {
    try {
      const normalizedPayload = normalizeScenarioComparisonExportRequest(payload)
      const scenarios = normalizeStoredScenarios()
      const scenarioMap = new Map(scenarios.map((scenario) => [scenario.id, scenario]))
      const selectedScenarios: Scenario[] = []
      const missingIds: string[] = []

      normalizedPayload.scenarioIds.forEach((id) => {
        const scenario = scenarioMap.get(id)
        if (!scenario) {
          missingIds.push(id)
          return
        }
        selectedScenarios.push(scenario)
      })

      if (missingIds.length > 0) {
        throw new Error(`選択されたシナリオが見つかりません: ${missingIds.join(', ')}`)
      }

      if (selectedScenarios.length < 2) {
        throw new Error('比較対象シナリオは2件以上必要です。')
      }

      const calculationSettings: GraphViewSettings = {
        predictionPeriod: normalizedPayload.untilYear,
        averageOvertimeHours: normalizedPayload.averageOvertimeHours,
        displayItem: ['netAnnual']
      }

      const entries: { scenario: Scenario; result: PredictionResult }[] = selectedScenarios.map((scenario) => {
        try {
          const result = calculatePrediction(
            {
              scenario,
              settings: calculationSettings
            },
            compiledActiveTaxSchema
          )
          if (!result.details[normalizedPayload.untilYear - 1]) {
            throw new Error(`${normalizedPayload.untilYear}年目までの結果を取得できませんでした。`)
          }
          return { scenario, result }
        } catch (error) {
          const reason = error instanceof Error ? error.message : '計算に失敗しました。'
          throw new Error(`シナリオ「${scenario.title}」の計算に失敗しました: ${reason}`)
        }
      })

      const now = new Date()
      const html = buildScenarioComparisonReportHtml({
        generatedAt: now,
        untilYear: normalizedPayload.untilYear,
        averageOvertimeHours: normalizedPayload.averageOvertimeHours,
        includeSections: normalizedPayload.includeSections,
        taxSchema: activeTaxSchema,
        entries,
        embeddedFontFaceCss: buildEmbeddedFontFaceCss()
      })

      const defaultFileName = buildScenarioComparisonDefaultFileName(
        now,
        entries.length,
        normalizedPayload.untilYear
      )
      const ownerWindow = BrowserWindow.fromWebContents(event.sender) ?? undefined
      const saveDialogOptions = {
        title: '比較レポート(PDF)を保存',
        defaultPath: join(app.getPath('documents'), defaultFileName),
        buttonLabel: '保存',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      }
      const { canceled, filePath } = ownerWindow
        ? await dialog.showSaveDialog(ownerWindow, saveDialogOptions)
        : await dialog.showSaveDialog(saveDialogOptions)

      if (canceled || !filePath) {
        return { success: false, error: '保存がキャンセルされました。' }
      }

      const pdfBuffer = await createPdfBufferFromHtml(html)
      await fs.promises.writeFile(filePath, pdfBuffer)

      return {
        success: true,
        filePath
      }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: '比較レポートの出力に失敗しました。' }
    }
  }

  ipcMain.handle('get-tax-schema', handleGetTaxSchema)
  ipcMain.handle('getTaxSchema', handleGetTaxSchema)
  ipcMain.handle('preview-tax-schema', handlePreviewTaxSchema)
  ipcMain.handle('apply-tax-schema', handleApplyTaxSchema)
  ipcMain.handle('update-tax-schema', handleUpdateTaxSchema)
  ipcMain.handle('updateTaxSchema', handleUpdateTaxSchema)
  ipcMain.handle('list-tax-schema-history', handleListTaxSchemaHistory)
  ipcMain.handle('restore-tax-schema', handleRestoreTaxSchema)
  ipcMain.handle('diff-tax-schema', handleDiffTaxSchema)
  ipcMain.handle('export-scenario-comparison-pdf', handleExportScenarioComparisonPdf)

  ipcMain.handle(
    'calculate-prediction',
    (
      _,
      {
        scenario,
        settings,
        taxSchemaOverride
      }: {
        scenario: Scenario
        settings: GraphViewSettings
        taxSchemaOverride?: TaxSchema
      }
    ): PredictionResult | { success: false; error: string } => {
      try {
        const parsedScenario = scenarioSchema.parse(scenario)

        let compiled = compiledActiveTaxSchema
        let effectiveSchema = activeTaxSchema

        if (taxSchemaOverride) {
          const parsedOverride = parseTaxSchemaUnknown(taxSchemaOverride)
          const normalizedOverride = normalizeTaxSchema(parsedOverride)
          const validated = validateAndCompile(normalizedOverride)
          if (validated.errors.length > 0 || !validated.compiled) {
            throw new Error(validated.errors.join('\n'))
          }
          compiled = validated.compiled
          effectiveSchema = normalizedOverride
        }

        const cacheSource = {
          settings,
          taxSchema: effectiveSchema
        }
        const settingsString = JSON.stringify(cacheSource)
        const settingsHash = crypto.createHash('sha256').update(settingsString).digest('hex')
        const cacheKey = `${parsedScenario.id}-${settingsHash}`

        if (initialCalculationCache.has(cacheKey)) {
          return initialCalculationCache.get(cacheKey)!
        }

        const result = calculatePrediction({ scenario: parsedScenario, settings }, compiled)

        initialCalculationCache.set(cacheKey, result)
        return result
      } catch (error) {
        console.error('Failed to calculate prediction:', error)
        if (error instanceof Error) return { success: false, error: error.message }
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
