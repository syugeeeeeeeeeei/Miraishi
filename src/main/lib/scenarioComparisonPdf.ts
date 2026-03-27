import type {
  PredictionResult,
  Scenario,
  ScenarioComparisonPdfIncludeSections,
  TaxSchemaV2
} from '@myTypes/miraishi'
import { INDUSTRY_OPTIONS, PREFECTURE_OPTIONS } from '../../shared/taxSchemaDefaults'

type ScenarioReportEntry = {
  scenario: Scenario
  result: PredictionResult
}

type BuildScenarioComparisonReportHtmlInput = {
  generatedAt: Date
  untilYear: number
  averageOvertimeHours: number
  includeSections: ScenarioComparisonPdfIncludeSections
  taxSchema: TaxSchemaV2
  entries: ScenarioReportEntry[]
  embeddedFontFaceCss?: string
}

type ScenarioPalette = {
  accent: string
  accentDark: string
  accentSoft: string
}

type DecoratedScenarioEntry = ScenarioReportEntry & {
  palette: ScenarioPalette
}

type GrowthStats = {
  grossIncrease: number
  netIncrease: number
  grossIncreaseRate: number
  netIncreaseRate: number
  grossCagr: number | null
  netCagr: number | null
  cumulativeGross: number
  cumulativeNet: number
}

type TrendPoint = {
  x: number
  y: number
}

type TrendDomain = {
  min: number
  max: number
}

type TrendPlotArea = {
  left: number
  right: number
  top: number
  bottom: number
}

type AnnualDetail = PredictionResult['details'][number]

const PREFECTURE_LABEL_MAP = new Map(PREFECTURE_OPTIONS.map((option) => [option.code, option.label]))
const INDUSTRY_LABEL_MAP = new Map(INDUSTRY_OPTIONS.map((option) => [option.code, option.label]))

const SCENARIO_PALETTES: ScenarioPalette[] = [
  { accent: '#0ea5e9', accentDark: '#075985', accentSoft: '#e0f2fe' },
  { accent: '#14b8a6', accentDark: '#0f766e', accentSoft: '#ccfbf1' },
  { accent: '#f97316', accentDark: '#c2410c', accentSoft: '#ffedd5' },
  { accent: '#8b5cf6', accentDark: '#6d28d9', accentSoft: '#ede9fe' },
  { accent: '#ef4444', accentDark: '#b91c1c', accentSoft: '#fee2e2' },
  { accent: '#22c55e', accentDark: '#15803d', accentSoft: '#dcfce7' }
]

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formatYen = (value: number): string =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0)

const formatNumber = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits
  }).format(Number.isFinite(value) ? value : 0)

const formatPercent = (ratio: number, maximumFractionDigits = 2): string => {
  if (!Number.isFinite(ratio)) {
    return '-'
  }
  return `${formatNumber(ratio * 100, maximumFractionDigits)}%`
}

const toDateTimeJst = (value: Date): string =>
  new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo'
  }).format(value)

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) {
    return [items]
  }
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

const formatAxisCurrency = (value: number): string => {
  const abs = Math.abs(value)
  if (abs >= 100000000) {
    return `${formatNumber(value / 100000000, 2)}億円`
  }
  if (abs >= 10000) {
    return `${formatNumber(value / 10000, 0)}万円`
  }
  return formatYen(value)
}

const formatBonusSetting = (scenario: Scenario): string => {
  const bonusMode = scenario.bonus?.mode ?? 'fixed'
  if (bonusMode === 'basicSalaryMonths') {
    return `基本給連動 ${formatNumber(scenario.bonus?.months ?? 0, 1)}ヶ月`
  }
  return `固定額 ${formatYen(scenario.annualBonus ?? 0)} / 年`
}

const calculateCagr = (start: number, end: number, periods: number): number | null => {
  if (periods <= 0 || start <= 0 || end < 0) {
    return null
  }
  return Math.pow(end / start, 1 / periods) - 1
}

const computeGrowthStats = (entry: ScenarioReportEntry, untilYear: number): GrowthStats | null => {
  const first = entry.result.details[0]
  const last = entry.result.details[untilYear - 1]
  if (!first || !last) {
    return null
  }

  const grossIncrease = last.grossAnnualIncome - first.grossAnnualIncome
  const netIncrease = last.netAnnualIncome - first.netAnnualIncome
  const grossIncreaseRate = first.grossAnnualIncome > 0 ? grossIncrease / first.grossAnnualIncome : Number.NaN
  const netIncreaseRate = first.netAnnualIncome > 0 ? netIncrease / first.netAnnualIncome : Number.NaN
  const periods = Math.max(0, untilYear - 1)
  const grossCagr = calculateCagr(first.grossAnnualIncome, last.grossAnnualIncome, periods)
  const netCagr = calculateCagr(first.netAnnualIncome, last.netAnnualIncome, periods)

  const cumulative = entry.result.details.slice(0, untilYear).reduce(
    (sum, detail) => {
      return {
        gross: sum.gross + detail.grossAnnualIncome,
        net: sum.net + detail.netAnnualIncome
      }
    },
    { gross: 0, net: 0 }
  )

  return {
    grossIncrease,
    netIncrease,
    grossIncreaseRate,
    netIncreaseRate,
    grossCagr,
    netCagr,
    cumulativeGross: cumulative.gross,
    cumulativeNet: cumulative.net
  }
}

const decorateEntries = (entries: ScenarioReportEntry[]): DecoratedScenarioEntry[] => {
  return entries.map((entry, index) => ({
    ...entry,
    palette: SCENARIO_PALETTES[index % SCENARIO_PALETTES.length]
  }))
}

const resolveTrendDomain = (values: number[]): TrendDomain => {
  const finiteValues = values.filter((value) => Number.isFinite(value))
  if (finiteValues.length === 0) {
    return { min: 0, max: 1 }
  }

  const min = Math.min(...finiteValues)
  const max = Math.max(...finiteValues)
  if (max === min) {
    const offset = Math.max(1, Math.abs(max) * 0.1)
    return {
      min: min - offset,
      max: max + offset
    }
  }

  const range = max - min
  const padding = Math.max(range * 0.08, 1)
  return {
    min: min - padding,
    max: max + padding
  }
}

const buildTrendPoints = (
  values: number[],
  width: number,
  height: number,
  plotArea: TrendPlotArea,
  domain: TrendDomain
): TrendPoint[] => {
  if (values.length === 0) {
    return []
  }

  const drawableWidth = Math.max(1, width - plotArea.left - plotArea.right)
  const drawableHeight = Math.max(1, height - plotArea.top - plotArea.bottom)
  const range = domain.max - domain.min === 0 ? 1 : domain.max - domain.min
  const step = values.length === 1 ? 0 : drawableWidth / (values.length - 1)

  return values.map((value, index) => {
    const safeValue = Number.isFinite(value) ? value : domain.min
    const x = plotArea.left + step * index
    const ratio = (safeValue - domain.min) / range
    const y = height - plotArea.bottom - ratio * drawableHeight
    return { x, y }
  })
}

const buildLinePath = (points: TrendPoint[]): string => {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

const buildAreaPath = (points: TrendPoint[], baselineY: number): string => {
  if (points.length === 0) {
    return ''
  }
  const first = points[0]
  const last = points[points.length - 1]
  return `${buildLinePath(points)} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(
    2
  )} ${baselineY.toFixed(2)} Z`
}

const buildYAxisTicks = (
  domain: TrendDomain,
  height: number,
  plotArea: TrendPlotArea,
  count: number
): Array<{ value: number; y: number; label: string }> => {
  const maxIndex = Math.max(1, count - 1)
  const drawableHeight = Math.max(1, height - plotArea.top - plotArea.bottom)

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / maxIndex
    const value = domain.max - (domain.max - domain.min) * ratio
    const y = plotArea.top + drawableHeight * ratio
    return {
      value,
      y,
      label: formatAxisCurrency(value)
    }
  })
}

const buildXAxisTickIndices = (length: number): number[] => {
  if (length <= 1) {
    return [0]
  }
  if (length === 2) {
    return [0, 1]
  }

  const mid = Math.floor((length - 1) / 2)
  return Array.from(new Set([0, mid, length - 1])).sort((left, right) => left - right)
}

const renderTrendSvg = (
  key: string,
  grossValues: number[],
  netValues: number[],
  palette: ScenarioPalette
): string => {
  const width = 760
  const height = 430
  const plotArea: TrendPlotArea = {
    left: 92,
    right: 36,
    top: 26,
    bottom: 68
  }

  const domain = resolveTrendDomain([...grossValues, ...netValues])
  const grossPoints = buildTrendPoints(grossValues, width, height, plotArea, domain)
  const netPoints = buildTrendPoints(netValues, width, height, plotArea, domain)
  const grossPath = buildLinePath(grossPoints)
  const netPath = buildLinePath(netPoints)
  const baselineY = height - plotArea.bottom
  const netAreaPath = buildAreaPath(netPoints, baselineY)
  const gradientId = `net-gradient-${key}`
  const yTicks = buildYAxisTicks(domain, height, plotArea, 4)
  const xTicks = buildXAxisTickIndices(Math.max(grossValues.length, netValues.length))
  const xTickLabels = xTicks.map((tickIndex) => {
    const point = netPoints[tickIndex] ?? grossPoints[tickIndex]
    return {
      x: point ? point.x : plotArea.left,
      label: `${tickIndex + 1}年目`
    }
  })

  const netLastPoint = netPoints[netPoints.length - 1]
  const grossLastPoint = grossPoints[grossPoints.length - 1]
  const netLastValue = netValues[netValues.length - 1] ?? 0
  const grossLastValue = grossValues[grossValues.length - 1] ?? 0

  return `
    <svg viewBox="0 0 ${width} ${height}" class="trend-svg" role="img" aria-label="年次推移グラフ">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      ${yTicks
        .map(
          (tick) => `
            <line x1="${plotArea.left}" y1="${tick.y.toFixed(2)}" x2="${width - plotArea.right}" y2="${tick.y.toFixed(
              2
            )}" stroke="${tick.value === domain.min ? '#cbd5e1' : '#e2e8f0'}" stroke-width="1" />
            <text x="${(plotArea.left - 8).toFixed(2)}" y="${(tick.y + 4).toFixed(
              2
            )}" text-anchor="end" fill="#64748b" font-size="12">${tick.label}</text>
          `
        )
        .join('')}
      <line x1="${plotArea.left}" y1="${plotArea.top}" x2="${plotArea.left}" y2="${baselineY}" stroke="#cbd5e1" stroke-width="1.2" />
      <line x1="${plotArea.left}" y1="${baselineY}" x2="${width - plotArea.right}" y2="${baselineY}" stroke="#cbd5e1" stroke-width="1.2" />
      ${xTickLabels
        .map(
          (tick) => `
            <line x1="${tick.x.toFixed(2)}" y1="${baselineY}" x2="${tick.x.toFixed(2)}" y2="${(baselineY + 5).toFixed(
              2
            )}" stroke="#94a3b8" stroke-width="1" />
            <text x="${tick.x.toFixed(2)}" y="${(baselineY + 20).toFixed(
              2
            )}" text-anchor="middle" fill="#64748b" font-size="11">${tick.label}</text>
          `
        )
        .join('')}
      <path d="${netAreaPath}" fill="url(#${gradientId})" />
      <path d="${grossPath}" fill="none" stroke="#334155" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${netPath}" fill="none" stroke="${palette.accent}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
      ${
        grossLastPoint
          ? `<circle cx="${grossLastPoint.x.toFixed(2)}" cy="${grossLastPoint.y.toFixed(
              2
            )}" r="3.8" fill="#334155" />`
          : ''
      }
      ${
        netLastPoint
          ? `<circle cx="${netLastPoint.x.toFixed(2)}" cy="${netLastPoint.y.toFixed(
              2
            )}" r="4.2" fill="${palette.accent}" />`
          : ''
      }
      ${
        grossLastPoint
          ? `<text x="${Math.max(plotArea.left + 90, grossLastPoint.x - 8).toFixed(2)}" y="${Math.max(
              plotArea.top + 14,
              grossLastPoint.y - 10
            ).toFixed(2)}" text-anchor="end" fill="#334155" font-size="11">額面: ${formatAxisCurrency(
              grossLastValue
            )}</text>`
          : ''
      }
      ${
        netLastPoint
          ? `<text x="${Math.max(plotArea.left + 90, netLastPoint.x - 8).toFixed(2)}" y="${Math.min(
              baselineY - 8,
              netLastPoint.y + 17
            ).toFixed(2)}" text-anchor="end" fill="${palette.accentDark}" font-size="11">手取り: ${formatAxisCurrency(
              netLastValue
            )}</text>`
          : ''
      }
      <text x="${plotArea.left}" y="14" fill="#64748b" font-size="12">年収（円）</text>
      <text x="${width - plotArea.right}" y="${height - 12}" text-anchor="end" fill="#64748b" font-size="12">年次</text>
    </svg>
  `
}

const buildRepresentativeYearIndexes = (untilYear: number): number[] => {
  const candidates = [0, 1, 2, 4, 6, 9, 14, 19, 29, 39, 49, untilYear - 1]
  const set = new Set<number>()

  candidates.forEach((candidate) => {
    if (candidate >= 0 && candidate < untilYear) {
      set.add(candidate)
    }
  })

  return Array.from(set).sort((left, right) => left - right)
}

const renderSlide = ({
  category,
  title,
  subtitle,
  body,
  themeClass = ''
}: {
  category: string
  title: string
  subtitle?: string
  body: string
  themeClass?: string
}): string => {
  return `
    <section class="slide ${themeClass}">
      <header class="slide-header">
        <span class="slide-category">${escapeHtml(category)}</span>
        <h2>${escapeHtml(title)}</h2>
        ${subtitle ? `<p class="slide-subtitle">${escapeHtml(subtitle)}</p>` : ''}
      </header>
      <div class="slide-body">${body}</div>
    </section>
  `
}

const renderCoverSlide = ({
  generatedAt,
  untilYear,
  averageOvertimeHours,
  taxSchema,
  scenarioCount
}: {
  generatedAt: Date
  untilYear: number
  averageOvertimeHours: number
  taxSchema: TaxSchemaV2
  scenarioCount: number
}): string => {
  return `
    <section class="slide cover-slide">
      <div class="cover-backdrop"></div>
      <div class="cover-body">
        <p class="cover-eyebrow">Miraishi Salary Deck</p>
        <h1>給与シナリオレポート</h1>
        <p class="cover-lead">条件・推移・成長を、読みやすく素早く判断できるスライド形式でまとめた資料です。</p>

        <div class="cover-chip-grid">
          <div class="cover-chip"><span>生成日時</span><strong>${escapeHtml(toDateTimeJst(generatedAt))}</strong></div>
          <div class="cover-chip"><span>対象シナリオ</span><strong>${scenarioCount}件</strong></div>
          <div class="cover-chip"><span>対象期間</span><strong>1年目〜${untilYear}年目</strong></div>
          <div class="cover-chip"><span>平均残業</span><strong>${formatNumber(averageOvertimeHours, 1)}h / 月</strong></div>
          <div class="cover-chip"><span>税制バージョン</span><strong>${escapeHtml(taxSchema.version)}</strong></div>
          <div class="cover-chip"><span>適用期間</span><strong>${escapeHtml(`${taxSchema.effectiveFrom} ～ ${taxSchema.effectiveTo ?? '未定'}`)}</strong></div>
        </div>
      </div>
      <p class="cover-note">※ 試算値です。制度改定時は税制スキーマの更新と再計算を行ってください。</p>
    </section>
  `
}

const renderConditionCard = (entry: DecoratedScenarioEntry, untilYear: number): string => {
  const { scenario, result, palette } = entry
  const latest = result.details[untilYear - 1]
  const hasSpouse = scenario.deductions?.dependents?.hasSpouse ? 'あり' : 'なし'
  const dependents = scenario.deductions?.dependents?.numberOfDependents ?? 0
  const fixedAllowancesMonthly = (scenario.allowances ?? []).reduce((sum, allowance) => {
    if (allowance.type !== 'fixed') {
      return sum
    }
    return sum + allowance.amount
  }, 0)

  const prefectureLabel =
    PREFECTURE_LABEL_MAP.get(scenario.taxProfile?.prefectureCode ?? '') ?? scenario.taxProfile?.prefectureCode ?? '-'
  const industryLabel =
    INDUSTRY_LABEL_MAP.get(scenario.taxProfile?.industryCode ?? '') ?? scenario.taxProfile?.industryCode ?? '-'

  return `
    <article class="scenario-card" style="--accent:${palette.accent}; --accent-dark:${palette.accentDark}; --accent-soft:${palette.accentSoft};">
      <header class="scenario-card-header">
        <h3>${escapeHtml(scenario.title)}</h3>
        <p>${escapeHtml(formatBonusSetting(scenario))}</p>
      </header>
      <div class="scenario-metrics">
        <div><span>初任給</span><strong>${formatYen(scenario.initialGrossSalary ?? 0)}</strong></div>
        <div><span>算出基本給</span><strong>${formatYen(scenario.initialBasicSalary ?? 0)}</strong></div>
        <div><span>昇給率</span><strong>${formatNumber(scenario.salaryGrowthRate ?? 0, 2)}%</strong></div>
        <div><span>${untilYear}年目手取り</span><strong>${latest ? formatYen(latest.netAnnualIncome) : '-'}</strong></div>
      </div>
      <dl class="scenario-facts">
        <div><dt>固定残業時間</dt><dd>${formatNumber(scenario.overtime?.fixedOvertime?.hours ?? 0, 1)}h</dd></div>
        <div><dt>年間休日数</dt><dd>${formatNumber(scenario.annualHolidays ?? 120, 0)}日</dd></div>
        <div><dt>勤務地</dt><dd>${escapeHtml(prefectureLabel)}</dd></div>
        <div><dt>業種</dt><dd>${escapeHtml(industryLabel)}</dd></div>
        <div><dt>扶養条件</dt><dd>${escapeHtml(`${hasSpouse} / 扶養${dependents}人`)}</dd></div>
        <div><dt>前年度収入</dt><dd>${formatYen(scenario.deductions?.previousYearIncome ?? 0)}</dd></div>
        <div><dt>固定手当（月）</dt><dd>${formatYen(fixedAllowancesMonthly)}</dd></div>
        <div><dt>手当件数</dt><dd>${formatNumber(scenario.allowances?.length ?? 0, 0)}件</dd></div>
      </dl>
    </article>
  `
}

export const renderConditionSlides = (entries: DecoratedScenarioEntry[], untilYear: number): string[] => {
  return chunkArray(entries, 4).map((chunk, chunkIndex, allChunks) => {
    const suffix = allChunks.length > 1 ? `（${chunkIndex + 1}/${allChunks.length}）` : ''
    return renderSlide({
      category: 'Scenario Setup',
      title: `シナリオ条件サマリ ${suffix}`,
      subtitle: '前提条件と入力値をカード形式で一覧表示',
      body: `<div class="card-grid two-cols">${chunk.map((entry) => renderConditionCard(entry, untilYear)).join('')}</div>`,
      themeClass: 'theme-conditions'
    })
  })
}

const renderTrendCard = (entry: DecoratedScenarioEntry, untilYear: number, index: number): string => {
  const details = entry.result.details.slice(0, untilYear)
  const grossValues = details.map((detail) => detail.grossAnnualIncome)
  const netValues = details.map((detail) => detail.netAnnualIncome)
  const first = details[0]
  const last = details[details.length - 1]
  const stats = computeGrowthStats(entry, untilYear)
  const deductionRate = last && last.grossAnnualIncome > 0 ? last.totalDeductions / last.grossAnnualIncome : 0
  const key = `${index}-${entry.scenario.id}`.replaceAll(/[^a-zA-Z0-9_-]/g, '')
  const summaryText = stats
    ? `手取りは1年目比で ${formatYen(stats.netIncrease)} 増（${formatPercent(stats.netIncreaseRate)}）、CAGR ${
        stats.netCagr === null ? '-' : formatPercent(stats.netCagr)
      }。`
    : '分析サマリーを生成できる十分なデータがありません。'

  return `
    <article class="trend-card" style="--accent:${entry.palette.accent}; --accent-soft:${entry.palette.accentSoft};">
      <header class="trend-card-header">
        <h3>${escapeHtml(entry.scenario.title)}</h3>
        <span>1年目〜${untilYear}年目</span>
      </header>
      <div class="trend-svg-wrap">${renderTrendSvg(key, grossValues, netValues, entry.palette)}</div>
      <div class="trend-legend">
        <span><i class="dot net"></i>手取り</span>
        <span><i class="dot gross"></i>額面</span>
      </div>
      <p class="trend-summary">${escapeHtml(summaryText)}</p>
      <div class="trend-metrics">
        <div><span>1年目額面</span><strong>${first ? formatYen(first.grossAnnualIncome) : '-'}</strong></div>
        <div><span>1年目手取り</span><strong>${first ? formatYen(first.netAnnualIncome) : '-'}</strong></div>
        <div><span>${untilYear}年目手取り</span><strong>${last ? formatYen(last.netAnnualIncome) : '-'}</strong></div>
        <div><span>${untilYear}年目額面</span><strong>${last ? formatYen(last.grossAnnualIncome) : '-'}</strong></div>
        <div><span>累計手取り</span><strong>${stats ? formatYen(stats.cumulativeNet) : '-'}</strong></div>
        <div><span>控除率</span><strong>${formatPercent(deductionRate)}</strong></div>
      </div>
    </article>
  `
}

export const renderTrendSlides = (entries: DecoratedScenarioEntry[], untilYear: number): string[] => {
  return chunkArray(entries, 2).map((chunk, chunkIndex, allChunks) => {
    const suffix = allChunks.length > 1 ? `（${chunkIndex + 1}/${allChunks.length}）` : ''
    return renderSlide({
      category: 'Income Trend',
      title: `年次推移ダッシュボード ${suffix}`,
      subtitle: '縦積み大型チャート（軸ラベル付き）で分析しやすく可視化',
      body: `<div class="trend-stack">${chunk
        .map((entry, index) => renderTrendCard(entry, untilYear, chunkIndex * 2 + index))
        .join('')}</div>`,
      themeClass: 'theme-trend'
    })
  })
}

const renderTaxBreakdownCardGraph = (detail: AnnualDetail): string => {
  const tax = detail.breakdown.deductions
  const incomeTax = Math.max(0, tax.incomeTax)
  const reconstructionTax = Math.max(0, tax.reconstructionSpecialIncomeTax)
  const residentTax = Math.max(0, tax.residentTax)
  const totalTax = incomeTax + reconstructionTax + residentTax

  const calcRatio = (value: number): number => {
    if (totalTax <= 0) {
      return 0
    }
    return (value / totalTax) * 100
  }

  const incomeRatio = calcRatio(incomeTax)
  const reconstructionRatio = calcRatio(reconstructionTax)
  const residentRatio = calcRatio(residentTax)

  return `
    <div class="annual-tax-graph">
      <div class="annual-tax-bar">
        <span class="annual-tax-segment annual-tax-income" style="width:${incomeRatio.toFixed(2)}%"></span>
        <span class="annual-tax-segment annual-tax-reconstruction" style="width:${reconstructionRatio.toFixed(
          2
        )}%"></span>
        <span class="annual-tax-segment annual-tax-resident" style="width:${residentRatio.toFixed(2)}%"></span>
      </div>
      <div class="annual-tax-total">税合計 ${formatYen(totalTax)}</div>
      <div class="annual-tax-legend">
        <div><i class="annual-tax-dot annual-tax-income"></i><span>所得税</span><b>${formatYen(incomeTax)}</b></div>
        <div><i class="annual-tax-dot annual-tax-reconstruction"></i><span>復興税</span><b>${formatYen(reconstructionTax)}</b></div>
        <div><i class="annual-tax-dot annual-tax-resident"></i><span>住民税</span><b>${formatYen(residentTax)}</b></div>
      </div>
    </div>
  `
}

const renderAnnualDetailCard = (detail: AnnualDetail, previousDetail: AnnualDetail | undefined): string => {
  const netRate =
    detail.grossAnnualIncome > 0 ? Math.max(0, Math.min(1, detail.netAnnualIncome / detail.grossAnnualIncome)) : 0

  const renderGrowthItem = (label: string, currentValue: number, previousValue: number | null): string => {
    if (previousValue === null) {
      return `
        <div class="annual-growth-item">
          <span>${label} 前年比</span>
          <strong>-</strong>
          <small>増加率 -</small>
        </div>
      `
    }

    const delta = currentValue - previousValue
    const rate = previousValue > 0 ? delta / previousValue : Number.NaN
    const trendClass = delta >= 0 ? 'is-positive' : 'is-negative'
    const deltaText = `${delta >= 0 ? '+' : ''}${formatYen(delta)}`
    const rateText = Number.isFinite(rate) ? `${delta >= 0 ? '+' : ''}${formatPercent(rate, 1)}` : '-'

    return `
      <div class="annual-growth-item ${trendClass}">
        <span>${label} 前年比</span>
        <strong>${deltaText}</strong>
        <small>増加率 ${rateText}</small>
      </div>
    `
  }

  return `
    <article class="annual-detail-card">
      <header class="annual-detail-card-header">
        <span class="annual-year-badge">${detail.year}年目</span>
        <span class="annual-net-rate">手取り率 ${formatPercent(netRate, 1)}</span>
      </header>

      <div class="annual-primary-values">
        <div class="annual-value annual-value-gross">
          <span>年収額面</span>
          <strong>${formatYen(detail.grossAnnualIncome)}</strong>
        </div>
        <div class="annual-value annual-value-net">
          <span>年収手取</span>
          <strong>${formatYen(detail.netAnnualIncome)}</strong>
        </div>
      </div>

      <div class="annual-monthly-values">
        <div><span>月給額面</span><strong>${formatYen(detail.grossAnnualIncome / 12)}</strong></div>
        <div><span>月給手取</span><strong>${formatYen(detail.netAnnualIncome / 12)}</strong></div>
      </div>

      <section class="annual-growth-values">
        ${renderGrowthItem('額面', detail.grossAnnualIncome, previousDetail?.grossAnnualIncome ?? null)}
        ${renderGrowthItem('手取', detail.netAnnualIncome, previousDetail?.netAnnualIncome ?? null)}
      </section>

      <section class="annual-tax-section">
        <h4>税金の内訳</h4>
        ${renderTaxBreakdownCardGraph(detail)}
      </section>
    </article>
  `
}

const splitAnnualDetailsInTwoPages = (details: AnnualDetail[]): [AnnualDetail[], AnnualDetail[]] => {
  const splitIndex = Math.ceil(details.length / 2)
  return [details.slice(0, splitIndex), details.slice(splitIndex)]
}

const renderAnnualDetailCardsPage = ({
  scenarioTitle,
  details,
  allDetails,
  pageNumber,
  totalPages
}: {
  scenarioTitle: string
  details: AnnualDetail[]
  allDetails: AnnualDetail[]
  pageNumber: number
  totalPages: number
}): string => {
  const rangeText =
    details.length > 0
      ? `${details[0].year}年目〜${details[details.length - 1].year}年目`
      : '対象年度なし'

  const detailsByYear = new Map(allDetails.map((detail) => [detail.year, detail]))

  return renderSlide({
    category: 'Scenario Summary',
    title: `${scenarioTitle} - 年度ごとの給与詳細 (${pageNumber}/${totalPages})`,
    subtitle: `${rangeText} / 年度カード形式`,
    body: `
      <section class="annual-detail-page">
        <div class="annual-detail-grid">
          ${
            details.length > 0
              ? details
                  .map((detail) => renderAnnualDetailCard(detail, detailsByYear.get(detail.year - 1)))
                  .join('')
              : '<article class="annual-detail-empty">該当する年度データがありません。</article>'
          }
        </div>
      </section>
    `,
    themeClass: 'theme-detail'
  })
}

const renderScenarioSummarySlides = (
  entry: DecoratedScenarioEntry,
  untilYear: number,
  index: number
): string[] => {
  const details = entry.result.details.slice(0, untilYear)
  const [pageOneDetails, pageTwoDetails] = splitAnnualDetailsInTwoPages(details)

  const scenario = entry.scenario
  const first = details[0]
  const last = details[details.length - 1]
  const stats = computeGrowthStats(entry, untilYear)
  const prefectureLabel =
    PREFECTURE_LABEL_MAP.get(scenario.taxProfile?.prefectureCode ?? '') ?? scenario.taxProfile?.prefectureCode ?? '-'
  const industryLabel =
    INDUSTRY_LABEL_MAP.get(scenario.taxProfile?.industryCode ?? '') ?? scenario.taxProfile?.industryCode ?? '-'

  const trendKey = `scenario-summary-${index}-${scenario.id}`.replaceAll(/[^a-zA-Z0-9_-]/g, '')
  const trendSvg = renderTrendSvg(
    trendKey,
    details.map((detail) => detail.grossAnnualIncome),
    details.map((detail) => detail.netAnnualIncome),
    entry.palette
  )
  const netIncrease = stats ? formatYen(stats.netIncrease) : '-'
  const netCagr = stats?.netCagr === null || !stats ? '-' : formatPercent(stats.netCagr)
  const deductionRate =
    last && last.grossAnnualIncome > 0
      ? formatPercent(last.totalDeductions / last.grossAnnualIncome, 1)
      : '-'
  const monthlyGross = last ? formatYen(last.grossAnnualIncome / 12) : '-'
  const monthlyNet = last ? formatYen(last.netAnnualIncome / 12) : '-'

  const slides: string[] = [
    renderSlide({
      category: 'Scenario Summary',
      title: `${scenario.title}`,
      subtitle: '初期入力条件 / 主要KPI / 年次推移グラフ',
      body: `
        <div class="scenario-summary-layout">
          <div class="summary-top-grid">
            <section class="summary-panel">
              <h3>初期入力条件</h3>
              <dl class="input-condition-grid">
                <div><dt>初任給</dt><dd>${formatYen(scenario.initialGrossSalary)}</dd></div>
                <div><dt>算出基本給</dt><dd>${formatYen(scenario.initialBasicSalary)}</dd></div>
                <div><dt>昇給率</dt><dd>${formatNumber(scenario.salaryGrowthRate, 2)}%</dd></div>
                <div><dt>固定残業時間</dt><dd>${formatNumber(scenario.overtime.fixedOvertime.hours, 1)}h</dd></div>
                <div><dt>年間休日数</dt><dd>${formatNumber(scenario.annualHolidays, 0)}日</dd></div>
                <div><dt>ボーナス</dt><dd>${escapeHtml(formatBonusSetting(scenario))}</dd></div>
                <div><dt>勤務地</dt><dd>${escapeHtml(prefectureLabel)}</dd></div>
                <div><dt>業種</dt><dd>${escapeHtml(industryLabel)}</dd></div>
                <div><dt>扶養条件</dt><dd>${escapeHtml(
                  `${scenario.deductions?.dependents?.hasSpouse ? '配偶者あり' : '配偶者なし'} / 扶養${
                    scenario.deductions?.dependents?.numberOfDependents ?? 0
                  }人`
                )}</dd></div>
              </dl>
            </section>

            <section class="summary-panel summary-kpi-panel">
              <h3>分析サマリー（${untilYear}年目時点）</h3>
              <div class="summary-kpi-grid">
                <div><span>1年目 年収額面</span><strong>${first ? formatYen(first.grossAnnualIncome) : '-'}</strong></div>
                <div><span>${untilYear}年目 年収手取</span><strong>${last ? formatYen(last.netAnnualIncome) : '-'}</strong></div>
                <div><span>手取り増加額</span><strong>${netIncrease}</strong></div>
                <div><span>手取りCAGR</span><strong>${netCagr}</strong></div>
                <div><span>${untilYear}年目 月給額面</span><strong>${monthlyGross}</strong></div>
                <div><span>${untilYear}年目 月給手取</span><strong>${monthlyNet}</strong></div>
                <div><span>${untilYear}年目 控除率</span><strong>${deductionRate}</strong></div>
                <div><span>累計手取り</span><strong>${stats ? formatYen(stats.cumulativeNet) : '-'}</strong></div>
              </div>
            </section>
          </div>

          <section class="summary-panel summary-trend-panel">
            <div class="summary-trend-head">
              <h3>年次推移グラフ</h3>
              <div class="summary-trend-legend">
                <span><i class="dot net"></i>手取り</span>
                <span><i class="dot gross"></i>額面</span>
              </div>
            </div>
            <div class="summary-trend-chart">${trendSvg}</div>
          </section>
        </div>
      `,
      themeClass: 'theme-detail'
    })
  ]

  slides.push(
    renderAnnualDetailCardsPage({
      scenarioTitle: scenario.title,
      details: pageOneDetails,
      allDetails: details,
      pageNumber: 1,
      totalPages: 2
    })
  )
  slides.push(
    renderAnnualDetailCardsPage({
      scenarioTitle: scenario.title,
      details: pageTwoDetails,
      allDetails: details,
      pageNumber: 2,
      totalPages: 2
    })
  )

  return slides
}

export const renderGrowthInsightSlide = (entries: DecoratedScenarioEntry[], untilYear: number): string => {
  const growth = entries
    .map((entry) => {
      const stats = computeGrowthStats(entry, untilYear)
      if (!stats) {
        return null
      }
      return { entry, stats }
    })
    .filter((item): item is { entry: DecoratedScenarioEntry; stats: GrowthStats } => item !== null)

  const pickTop = (
    selector: (item: { entry: DecoratedScenarioEntry; stats: GrowthStats }) => number
  ): { entry: DecoratedScenarioEntry; stats: GrowthStats } | null => {
    if (growth.length === 0) {
      return null
    }
    return [...growth].sort((left, right) => selector(right) - selector(left))[0]
  }

  const topNetIncrease = pickTop((item) => item.stats.netIncrease)
  const topNetCagr = pickTop((item) => item.stats.netCagr ?? Number.NEGATIVE_INFINITY)
  const topCumulativeNet = pickTop((item) => item.stats.cumulativeNet)

  const latestNetValues = growth
    .map((item) => {
      const last = item.entry.result.details[untilYear - 1]
      return {
        title: item.entry.scenario.title,
        palette: item.entry.palette,
        value: last?.netAnnualIncome ?? 0
      }
    })
    .sort((left, right) => right.value - left.value)

  const maxLatestNet = latestNetValues.length > 0 ? latestNetValues[0].value : 1

  const highlightCard = (
    label: string,
    metric: string,
    top: { entry: DecoratedScenarioEntry; stats: GrowthStats } | null
  ): string => {
    if (!top) {
      return `<article class="highlight-card"><span>${escapeHtml(label)}</span><strong>-</strong><p>対象データなし</p></article>`
    }
    return `
      <article class="highlight-card" style="--accent:${top.entry.palette.accent}; --accent-soft:${top.entry.palette.accentSoft};">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(top.entry.scenario.title)}</strong>
        <p>${metric}</p>
      </article>
    `
  }

  return renderSlide({
    category: 'Growth Insight',
    title: `成長ハイライト（Year1 → Year${untilYear}）`,
    subtitle: '主要指標とランキングを1枚に集約',
    body: `
      <div class="insight-layout">
        <div class="highlight-grid">
          ${highlightCard('手取り増加額トップ', topNetIncrease ? formatYen(topNetIncrease.stats.netIncrease) : '-', topNetIncrease)}
          ${highlightCard(
            '手取りCAGRトップ',
            topNetCagr && topNetCagr.stats.netCagr !== null ? formatPercent(topNetCagr.stats.netCagr) : '-',
            topNetCagr
          )}
          ${highlightCard('累計手取りトップ', topCumulativeNet ? formatYen(topCumulativeNet.stats.cumulativeNet) : '-', topCumulativeNet)}
        </div>
        <div class="ranking-panel">
          <h3>${untilYear}年目 手取りランキング</h3>
          <div class="ranking-list">
            ${latestNetValues
              .map((item, rank) => {
                const width = maxLatestNet > 0 ? (item.value / maxLatestNet) * 100 : 0
                return `
                  <div class="ranking-row">
                    <div class="ranking-title">
                      <span class="rank">${rank + 1}</span>
                      <span class="label">${escapeHtml(item.title)}</span>
                    </div>
                    <div class="ranking-bar-wrap"><div class="ranking-bar" style="width:${width}%; background:${item.palette.accent};"></div></div>
                    <div class="ranking-value">${formatYen(item.value)}</div>
                  </div>
                `
              })
              .join('')}
          </div>
        </div>
      </div>
    `,
    themeClass: 'theme-growth'
  })
}

export const renderScenarioDetailSlide = (entry: DecoratedScenarioEntry, untilYear: number): string => {
  const { scenario, result } = entry
  const first = result.details[0]
  const last = result.details[untilYear - 1]
  const growth = computeGrowthStats(entry, untilYear)
  const representativeIndexes = buildRepresentativeYearIndexes(untilYear)

  const snapshotRows = representativeIndexes
    .map((index) => {
      const detail = result.details[index]
      if (!detail) {
        return ''
      }
      return `
        <tr>
          <th>${detail.year}年目</th>
          <td class="number">${formatYen(detail.grossAnnualIncome)}</td>
          <td class="number">${formatYen(detail.netAnnualIncome)}</td>
          <td class="number">${formatYen(detail.totalDeductions)}</td>
          <td class="number">${formatYen(detail.netAnnualIncome / 12)}</td>
        </tr>
      `
    })
    .join('')

  const latestDeduction = last?.breakdown.deductions
  const deductionTotal = latestDeduction
    ? latestDeduction.healthInsurance +
      latestDeduction.pensionInsurance +
      latestDeduction.employmentInsurance +
      latestDeduction.incomeTax +
      latestDeduction.reconstructionSpecialIncomeTax +
      latestDeduction.residentTax
    : 0

  const ratio = (value: number): string => {
    if (deductionTotal <= 0) {
      return '0%'
    }
    return `${Math.max(0, Math.min(100, (value / deductionTotal) * 100)).toFixed(2)}%`
  }

  return renderSlide({
    category: 'Scenario Deep Dive',
    title: scenario.title,
    subtitle: `1年目〜${untilYear}年目の推移と${untilYear}年目控除構成`,
    body: `
      <div class="detail-layout">
        <section class="detail-panel">
          <h3>主要KPI</h3>
          <div class="kpi-grid">
            <div><span>1年目 額面</span><strong>${first ? formatYen(first.grossAnnualIncome) : '-'}</strong></div>
            <div><span>1年目 手取り</span><strong>${first ? formatYen(first.netAnnualIncome) : '-'}</strong></div>
            <div><span>${untilYear}年目 額面</span><strong>${last ? formatYen(last.grossAnnualIncome) : '-'}</strong></div>
            <div><span>${untilYear}年目 手取り</span><strong>${last ? formatYen(last.netAnnualIncome) : '-'}</strong></div>
            <div><span>手取り増加額</span><strong>${growth ? formatYen(growth.netIncrease) : '-'}</strong></div>
            <div><span>手取りCAGR</span><strong>${growth?.netCagr !== null && growth ? formatPercent(growth.netCagr) : '-'}</strong></div>
          </div>
          <h3>入力条件</h3>
          <dl class="fact-list">
            <div><dt>初任給</dt><dd>${formatYen(scenario.initialGrossSalary)}</dd></div>
            <div><dt>固定残業時間</dt><dd>${formatNumber(scenario.overtime.fixedOvertime.hours, 1)}h</dd></div>
            <div><dt>年間休日数</dt><dd>${formatNumber(scenario.annualHolidays, 0)}日</dd></div>
            <div><dt>ボーナス</dt><dd>${escapeHtml(formatBonusSetting(scenario))}</dd></div>
            <div><dt>昇給率</dt><dd>${formatNumber(scenario.salaryGrowthRate, 2)}%</dd></div>
          </dl>
        </section>
        <section class="detail-panel">
          <h3>${untilYear}年目 控除構成</h3>
          <div class="deduction-stack">
            <div class="deduction-row"><span>健康保険</span><b>${latestDeduction ? formatYen(latestDeduction.healthInsurance) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.healthInsurance) : '0%'}; background:#0ea5e9;"></i></div>
            <div class="deduction-row"><span>厚生年金</span><b>${latestDeduction ? formatYen(latestDeduction.pensionInsurance) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.pensionInsurance) : '0%'}; background:#14b8a6;"></i></div>
            <div class="deduction-row"><span>雇用保険</span><b>${latestDeduction ? formatYen(latestDeduction.employmentInsurance) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.employmentInsurance) : '0%'}; background:#22c55e;"></i></div>
            <div class="deduction-row"><span>所得税</span><b>${latestDeduction ? formatYen(latestDeduction.incomeTax) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.incomeTax) : '0%'}; background:#f97316;"></i></div>
            <div class="deduction-row"><span>復興特別所得税</span><b>${latestDeduction ? formatYen(latestDeduction.reconstructionSpecialIncomeTax) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.reconstructionSpecialIncomeTax) : '0%'}; background:#8b5cf6;"></i></div>
            <div class="deduction-row"><span>住民税</span><b>${latestDeduction ? formatYen(latestDeduction.residentTax) : '-'}</b><i style="width:${latestDeduction ? ratio(latestDeduction.residentTax) : '0%'}; background:#ef4444;"></i></div>
          </div>
          <h3>代表年スナップショット</h3>
          <table class="compact-table">
            <thead>
              <tr>
                <th>年度</th>
                <th>額面年収</th>
                <th>手取り年収</th>
                <th>控除合計</th>
                <th>月手取り</th>
              </tr>
            </thead>
            <tbody>${snapshotRows}</tbody>
          </table>
        </section>
      </div>
    `,
    themeClass: 'theme-detail'
  })
}

const renderTaxMetaSlide = (taxSchema: TaxSchemaV2): string => {
  const healthInsurance = taxSchema.rules.socialInsurance.healthInsurance
  const healthInsuranceMode =
    healthInsurance.rateMode === 'prefecture' ? '都道府県別(rateByPrefecture)' : '単一率(rate)'

  const incomeTaxRows = taxSchema.rules.incomeTaxRates
    .slice(0, 7)
    .map(
      (row) => `
        <tr>
          <th>${row.threshold === null ? '上限なし' : `${formatNumber(row.threshold, 0)}円以下`}</th>
          <td>${formatPercent(row.rate)}</td>
          <td>${formatYen(row.deduction)}</td>
        </tr>
      `
    )
    .join('')

  return renderSlide({
    category: 'Tax Schema',
    title: '税制スキーマと計算前提',
    subtitle: 'このレポートに適用した税制ルール',
    body: `
      <div class="tax-layout">
        <article class="tax-panel">
          <h3>スキーマ情報</h3>
          <dl>
            <div><dt>schemaVersion</dt><dd>${escapeHtml(taxSchema.schemaVersion)}</dd></div>
            <div><dt>lawVersion</dt><dd>${escapeHtml(taxSchema.version)}</dd></div>
            <div><dt>effectiveFrom</dt><dd>${escapeHtml(taxSchema.effectiveFrom)}</dd></div>
            <div><dt>effectiveTo</dt><dd>${escapeHtml(taxSchema.effectiveTo ?? '未定')}</dd></div>
            <div><dt>formula.steps</dt><dd>${formatNumber(taxSchema.formula.steps.length, 0)}件</dd></div>
          </dl>
        </article>
        <article class="tax-panel">
          <h3>主要税率</h3>
          <dl>
            <div><dt>住民税率</dt><dd>${formatPercent(taxSchema.rules.residentTaxRate)}</dd></div>
            <div><dt>復興特別所得税率</dt><dd>${formatPercent(taxSchema.rules.reconstructionSpecialIncomeTaxRate)}</dd></div>
            <div><dt>健康保険率モード</dt><dd>${escapeHtml(healthInsuranceMode)}</dd></div>
            <div><dt>厚生年金率（全額）</dt><dd>${formatPercent(taxSchema.rules.socialInsurance.pension.rate)}</dd></div>
            <div><dt>雇用保険率（一般）</dt><dd>${formatPercent(
              taxSchema.rules.socialInsurance.employmentInsurance.employeeRateByIndustry.general ?? 0
            )}</dd></div>
          </dl>
        </article>
      </div>
      <article class="tax-panel tax-wide">
        <h3>所得税率テーブル（抜粋）</h3>
        <table class="compact-table">
          <thead>
            <tr><th>課税所得帯</th><th>税率</th><th>控除額</th></tr>
          </thead>
          <tbody>${incomeTaxRows}</tbody>
        </table>
      </article>
      <p class="tax-note">※ 住民税は前年基準（1年目は前年度収入）。金額は表示時四捨五入です。</p>
    `,
    themeClass: 'theme-tax'
  })
}

export const buildScenarioComparisonDefaultFileName = (
  now: Date,
  scenarioCount: number,
  untilYear: number
): string => {
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `scenario_comparison_${yyyy}${mm}${dd}_${hh}${mi}${ss}_${scenarioCount}scenarios_Y${untilYear}.pdf`
}

export const buildScenarioComparisonReportHtml = ({
  generatedAt,
  untilYear,
  averageOvertimeHours,
  includeSections,
  taxSchema,
  entries,
  embeddedFontFaceCss
}: BuildScenarioComparisonReportHtmlInput): string => {
  const decoratedEntries = decorateEntries(entries)
  const slides: string[] = []

  const shouldRenderScenarioSummaries =
    includeSections.conditions ||
    includeSections.yearlyComparison ||
    includeSections.growthSummary ||
    includeSections.scenarioDetails

  if (shouldRenderScenarioSummaries) {
    decoratedEntries.forEach((entry, index) => {
      slides.push(...renderScenarioSummarySlides(entry, untilYear, index))
    })
  }

  if (includeSections.taxMeta) {
    slides.push(renderTaxMetaSlide(taxSchema))
  }

  const cover = renderCoverSlide({
    generatedAt,
    untilYear,
    averageOvertimeHours,
    taxSchema,
    scenarioCount: entries.length
  })

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>シナリオ比較レポート</title>
    <style>
      @page { size: A4 portrait; margin: 8mm; }
      * { box-sizing: border-box; }
      ${embeddedFontFaceCss ?? ''}

      body {
        margin: 0;
        color: #0f172a;
        background: #f8fafc;
        font-family: "Zen Maru Gothic", "M PLUS Rounded 1c", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
        font-size: 10.4px;
        line-height: 1.36;
      }
      h1, h2, h3, h4, p { margin: 0; }

      .slide {
        min-height: calc(297mm - 16mm);
        border-radius: 15px;
        background: linear-gradient(165deg, #ffffff 0%, #f8fbff 100%);
        border: 1px solid #dbe7f6;
        padding: 7mm;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .slide + .slide {
        break-before: page;
        page-break-before: always;
      }
      .slide::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 37%;
        height: 6px;
        border-bottom-left-radius: 20px;
        background: linear-gradient(90deg, #0ea5e9, #14b8a6, #22c55e);
      }

      .slide-header { margin-bottom: 4.5mm; }
      .slide-category {
        display: inline-block;
        font-size: 9.6px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #0369a1;
        font-weight: 700;
        background: #e0f2fe;
        border: 1px solid #bae6fd;
        border-radius: 999px;
        padding: 2px 8px;
      }
      .slide-header h2 {
        margin-top: 2.5mm;
        font-size: 21px;
        line-height: 1.14;
      }
      .slide-subtitle {
        margin-top: 2mm;
        color: #475569;
        font-size: 11px;
      }
      .slide-body { flex: 1; }

      .cover-slide {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 44%, #0f766e 100%);
        border-color: #1f2937;
        color: #f8fafc;
        justify-content: space-between;
      }
      .cover-slide::before { background: rgba(255, 255, 255, 0.34); }
      .cover-backdrop {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.27), transparent 45%),
          radial-gradient(circle at 88% 12%, rgba(16, 185, 129, 0.2), transparent 40%),
          radial-gradient(circle at 75% 82%, rgba(45, 212, 191, 0.18), transparent 40%);
      }
      .cover-body { position: relative; z-index: 1; }
      .cover-eyebrow {
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 10px;
        color: #e2e8f0;
      }
      .cover-body h1 {
        margin-top: 5mm;
        font-size: 34px;
        line-height: 1.1;
      }
      .cover-lead {
        margin-top: 4mm;
        max-width: 73%;
        font-size: 12.8px;
        color: rgba(248, 250, 252, 0.93);
      }
      .cover-chip-grid {
        margin-top: 7mm;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      .cover-chip {
        padding: 8px 10px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.25);
      }
      .cover-chip span {
        display: block;
        font-size: 9px;
        color: rgba(226, 232, 240, 0.94);
      }
      .cover-chip strong {
        display: block;
        margin-top: 3px;
        font-size: 12px;
        line-height: 1.25;
      }
      .cover-note {
        position: relative;
        z-index: 1;
        color: rgba(226, 232, 240, 0.92);
        font-size: 9.6px;
      }

      .card-grid { display: grid; gap: 9px; }
      .card-grid.two-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }

      .scenario-card,
      .trend-card,
      .detail-panel,
      .tax-panel,
      .highlight-card,
      .ranking-panel {
        border-radius: 12px;
        border: 1px solid #dbe7f6;
        background: #ffffff;
      }

      .scenario-card {
        background: linear-gradient(165deg, var(--accent-soft) 0%, #ffffff 55%);
        border-color: rgba(148, 163, 184, 0.32);
        padding: 9px;
      }
      .scenario-card-header h3 { font-size: 14px; color: var(--accent-dark); }
      .scenario-card-header p { margin-top: 2px; color: #475569; font-size: 10px; }
      .scenario-metrics {
        margin-top: 6px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5px;
      }
      .scenario-metrics div {
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(255, 255, 255, 0.86);
        padding: 5px 6px;
      }
      .scenario-metrics span { display: block; color: #64748b; font-size: 8.8px; }
      .scenario-metrics strong { display: block; margin-top: 2px; font-size: 10px; }
      .scenario-facts {
        margin: 7px 0 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 6px;
      }
      .scenario-facts div {
        display: flex;
        justify-content: space-between;
        gap: 6px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.72);
        padding: 4px 6px;
      }
      .scenario-facts dt { color: #64748b; font-size: 8.6px; }
      .scenario-facts dd {
        margin: 0;
        font-size: 9.4px;
        font-weight: 700;
        text-align: right;
      }

      .summary-panel {
        border-radius: 12px;
        border: 1px solid #dbe7f6;
        background: #ffffff;
        padding: 9px;
      }
      .scenario-summary-layout {
        height: 100%;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 10px;
      }
      .summary-top-grid {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 10px;
      }
      .summary-panel h3 {
        margin: 0 0 7px;
        font-size: 13.6px;
        color: #0f172a;
      }
      .input-condition-grid {
        margin: 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px 9px;
      }
      .input-condition-grid div {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        border-radius: 8px;
        background: #f8fbff;
        border: 1px solid #e2e8f0;
        padding: 6px 8px;
      }
      .input-condition-grid dt {
        color: #64748b;
        font-size: 10px;
      }
      .input-condition-grid dd {
        margin: 0;
        font-size: 11.2px;
        font-weight: 700;
        text-align: right;
      }
      .summary-kpi-panel {
        background: linear-gradient(165deg, #f8fffc 0%, #ffffff 56%);
      }
      .summary-kpi-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .summary-kpi-grid div {
        border: 1px solid #dbe7f6;
        border-radius: 9px;
        background: #ffffff;
        padding: 7px 8px;
      }
      .summary-kpi-grid span {
        display: block;
        color: #64748b;
        font-size: 9.2px;
      }
      .summary-kpi-grid strong {
        display: block;
        margin-top: 3px;
        color: #0f172a;
        font-size: 11.2px;
      }
      .summary-trend-panel {
        display: flex;
        flex-direction: column;
      }
      .summary-trend-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 4px;
      }
      .summary-trend-legend {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #475569;
        font-size: 9.8px;
      }
      .summary-trend-legend .dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        margin-right: 4px;
        vertical-align: middle;
      }
      .summary-trend-legend .dot.net { background: #0ea5e9; }
      .summary-trend-legend .dot.gross { background: #334155; }
      .summary-trend-chart {
        flex: 1;
        min-height: 330px;
      }
      .summary-trend-chart .trend-svg {
        height: 100%;
      }
      .summary-table-panel {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .summary-table-panel.full-height {
        height: 100%;
      }
      .annual-detail-page {
        height: 100%;
      }
      .annual-detail-grid {
        height: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        align-content: start;
      }
      .annual-detail-card {
        border-radius: 14px;
        border: 1px solid #dbe7f6;
        background: linear-gradient(170deg, #f8fbff 0%, #ffffff 60%);
        padding: 9px;
        display: grid;
        gap: 7px;
      }
      .annual-detail-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }
      .annual-year-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: #0ea5e9;
        color: #ffffff;
        font-weight: 700;
        font-size: 8.8px;
        padding: 2px 8px;
      }
      .annual-net-rate {
        color: #475569;
        font-size: 8.6px;
      }
      .annual-primary-values {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .annual-value {
        border: 1px solid #dbe7f6;
        border-radius: 9px;
        padding: 5px 6px;
        background: #ffffff;
      }
      .annual-value span {
        display: block;
        color: #64748b;
        font-size: 8.3px;
      }
      .annual-value strong {
        display: block;
        margin-top: 2px;
        font-size: 10px;
      }
      .annual-value-gross strong { color: #334155; }
      .annual-value-net strong { color: #0f766e; }
      .annual-monthly-values {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .annual-monthly-values div {
        border: 1px solid #dbe7f6;
        border-radius: 8px;
        background: #ffffff;
        padding: 4px 6px;
      }
      .annual-monthly-values span {
        display: block;
        color: #64748b;
        font-size: 8.1px;
      }
      .annual-monthly-values strong {
        display: block;
        margin-top: 2px;
        font-size: 9.4px;
      }
      .annual-growth-values {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .annual-growth-item {
        border: 1px solid #dbe7f6;
        border-radius: 8px;
        background: #ffffff;
        padding: 4px 6px;
      }
      .annual-growth-item span {
        display: block;
        color: #64748b;
        font-size: 8.1px;
      }
      .annual-growth-item strong {
        display: block;
        margin-top: 1px;
        font-size: 9.5px;
        color: #334155;
      }
      .annual-growth-item small {
        display: block;
        margin-top: 1px;
        font-size: 7.9px;
        color: #64748b;
      }
      .annual-growth-item.is-positive strong {
        color: #047857;
      }
      .annual-growth-item.is-negative strong {
        color: #b91c1c;
      }
      .annual-tax-section h4 {
        margin: 0 0 3px;
        color: #334155;
        font-size: 9px;
      }
      .annual-tax-graph {
        display: grid;
        gap: 3px;
      }
      .annual-tax-bar {
        display: flex;
        height: 8px;
        border-radius: 999px;
        overflow: hidden;
        background: #e2e8f0;
      }
      .annual-tax-segment {
        display: block;
        height: 100%;
      }
      .annual-tax-income {
        background: #f97316;
      }
      .annual-tax-reconstruction {
        background: #8b5cf6;
      }
      .annual-tax-resident {
        background: #ef4444;
      }
      .annual-tax-total {
        font-size: 8.1px;
        color: #475569;
      }
      .annual-tax-legend {
        display: grid;
        gap: 1px;
      }
      .annual-tax-legend div {
        display: grid;
        grid-template-columns: auto 38px 1fr;
        gap: 4px;
        align-items: center;
      }
      .annual-tax-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        display: inline-block;
      }
      .annual-tax-legend span {
        color: #64748b;
        font-size: 8px;
      }
      .annual-tax-legend b {
        font-weight: 600;
        font-size: 8.2px;
        text-align: right;
      }
      .annual-detail-empty {
        border-radius: 12px;
        border: 1px dashed #cbd5e1;
        background: #f8fafc;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 140px;
        font-size: 10px;
      }

      .trend-stack {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .trend-card {
        flex: 1;
        min-height: 0;
        padding: 10px;
        background: linear-gradient(170deg, var(--accent-soft) 0%, #ffffff 62%);
        display: flex;
        flex-direction: column;
      }
      .trend-card-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      .trend-card h3 { font-size: 15px; }
      .trend-card-header span { font-size: 10px; color: #475569; }
      .trend-svg-wrap {
        margin-top: 7px;
        border-radius: 10px;
        border: 1px solid #dbe7f6;
        background: #f8fbff;
        padding: 6px 8px 4px;
        flex: 1;
        min-height: 182px;
      }
      .trend-svg {
        display: block;
        width: 100%;
        height: 100%;
      }
      .trend-legend {
        margin-top: 5px;
        display: flex;
        gap: 12px;
        font-size: 9px;
        color: #475569;
      }
      .trend-legend .dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        margin-right: 4px;
        vertical-align: middle;
      }
      .trend-legend .dot.net { background: var(--accent); }
      .trend-legend .dot.gross { background: #334155; }
      .trend-summary {
        margin-top: 5px;
        border-radius: 8px;
        background: rgba(248, 250, 252, 0.92);
        border: 1px solid #dbe7f6;
        padding: 5px 7px;
        color: #334155;
        font-size: 9.2px;
      }
      .trend-metrics {
        margin-top: 6px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .trend-metrics div {
        border-radius: 8px;
        border: 1px solid #dbe7f6;
        background: #ffffff;
        padding: 5px 6px;
      }
      .trend-metrics span { display: block; color: #64748b; font-size: 8.9px; }
      .trend-metrics strong { display: block; margin-top: 2px; font-size: 10px; }

      .insight-layout {
        display: grid;
        grid-template-columns: 1.12fr 1fr;
        gap: 10px;
        height: 100%;
      }
      .highlight-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      .highlight-card {
        background: linear-gradient(160deg, var(--accent-soft, #e2e8f0), #ffffff 56%);
        border-color: rgba(148, 163, 184, 0.34);
        padding: 10px;
      }
      .highlight-card span { display: block; color: #64748b; font-size: 9px; }
      .highlight-card strong { display: block; margin-top: 4px; font-size: 14px; }
      .highlight-card p { margin-top: 4px; font-size: 10px; color: #334155; }

      .ranking-panel {
        padding: 10px;
        background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
      }
      .ranking-panel h3 { font-size: 14px; }
      .ranking-list {
        margin-top: 6px;
        display: grid;
        gap: 6px;
      }
      .ranking-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
      }
      .ranking-title {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .rank {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #e2e8f0;
        color: #0f172a;
        font-weight: 700;
        font-size: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ranking-bar-wrap {
        border-radius: 999px;
        background: #e2e8f0;
        height: 8px;
        overflow: hidden;
      }
      .ranking-bar {
        height: 100%;
        border-radius: 999px;
      }
      .ranking-value {
        font-size: 9.8px;
        font-weight: 700;
        white-space: nowrap;
      }

      .detail-layout {
        display: grid;
        grid-template-columns: 0.9fr 1.1fr;
        gap: 10px;
        height: 100%;
      }
      .detail-panel {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .detail-panel h3 { font-size: 12px; color: #0f172a; }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5px;
      }
      .kpi-grid div {
        border: 1px solid #dbe7f6;
        border-radius: 8px;
        background: #f8fbff;
        padding: 5px 6px;
      }
      .kpi-grid span,
      .fact-list dt {
        color: #64748b;
        font-size: 8.8px;
      }
      .kpi-grid strong,
      .fact-list dd {
        font-size: 9.8px;
        margin: 0;
        font-weight: 700;
      }
      .fact-list {
        margin: 0;
        display: grid;
        gap: 5px;
      }
      .fact-list div {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 0;
        border-bottom: 1px dashed #dbe7f6;
      }
      .fact-list dd { text-align: right; }
      .deduction-stack { display: grid; gap: 6px; }
      .deduction-row {
        position: relative;
        display: grid;
        grid-template-columns: 90px 1fr;
        gap: 8px;
        align-items: center;
        font-size: 9.4px;
      }
      .deduction-row span { color: #334155; }
      .deduction-row b { font-size: 9.4px; justify-self: start; }
      .deduction-row i {
        grid-column: 1 / -1;
        display: block;
        height: 7px;
        border-radius: 999px;
        background: #cbd5e1;
      }

      .compact-table {
        width: 100%;
        border-collapse: collapse;
      }
      .compact-table th,
      .compact-table td {
        border: 1px solid #dbe7f6;
        padding: 4px 5px;
      }
      .compact-table thead th { background: #f1f5f9; }
      .compact-table tbody tr:nth-child(even) th,
      .compact-table tbody tr:nth-child(even) td { background: #f8fbff; }
      .number {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .tax-layout {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .tax-panel {
        padding: 10px;
        background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
      }
      .tax-panel h3 { font-size: 12px; margin-bottom: 6px; }
      .tax-panel dl {
        margin: 0;
        display: grid;
        gap: 4px;
      }
      .tax-panel dl div {
        display: grid;
        grid-template-columns: 150px 1fr;
        gap: 8px;
        align-items: baseline;
      }
      .tax-panel dt { color: #64748b; font-size: 9px; }
      .tax-panel dd { margin: 0; font-size: 10px; font-weight: 700; }
      .tax-wide { margin-top: 10px; }
      .tax-note {
        margin-top: 8px;
        font-size: 9px;
        color: #475569;
      }

      .theme-conditions { background: linear-gradient(180deg, #f8fbff 0%, #ffffff 26%); }
      .theme-trend { background: linear-gradient(180deg, #f8fffc 0%, #ffffff 26%); }
      .theme-growth { background: linear-gradient(180deg, #fffaf5 0%, #ffffff 26%); }
      .theme-detail { background: linear-gradient(180deg, #f8faff 0%, #ffffff 26%); }
      .theme-tax { background: linear-gradient(180deg, #f8fafc 0%, #ffffff 24%); }
    </style>
  </head>
  <body>
    ${cover}
    ${slides.join('')}
  </body>
</html>`
}
