# 実装計画

## 1. 目的

- 複数選択したシナリオを横断比較し、指定した年目までの給与推移・成長指標・前提条件を PDF として出力できるようにする。
- 税制スキーマ変更やシナリオ再編集後も、同じ条件で再出力できる再現性を持たせる。

## 2. スコープ

- 対象: ローカルアプリ内の選択中シナリオ（`activeScenarioIds`）
- 出力形式: PDF（A4 縦、必要箇所は横向きページ）
- 出力単位: 1回のエクスポートで 1ファイル
- 対象年: 1年目〜指定年（最大 50 年）

## 3. UI仕様

- 導線: システムラジアルメニューに `比較レポート(PDF)` を追加する。
- クリック時: `PDFエクスポート設定ダイアログ` を表示する。
- ダイアログ項目:
  - 出力対象シナリオ: 既定で現在の複数選択（active）
  - 比較対象年（`untilYear`）: 1〜50（既定は現在の `graphViewSettings.predictionPeriod`）
  - 月平均残業時間: 既定は現在の `graphViewSettings.averageOvertimeHours`
  - セクション含有（既定は全ON）
    - 条件比較サマリ
    - 年次比較テーブル
    - 成長指標サマリ
    - シナリオ別詳細
    - 税制スキーマ情報
- ボタン状態:
  - シナリオ選択数が 2 未満なら `エクスポート` を disable
  - エクスポート中はローディング表示

## 4. PDF掲載情報（固定）

- 表紙
  - レポート名
  - 生成日時
  - 対象年（N年目まで）
  - 計算条件（平均残業時間）
  - 税制スキーマバージョン（`schemaVersion`, `version`, `effectiveFrom`, `effectiveTo`）
- セクション1: シナリオ条件比較（横持ち表）
  - タイトル
  - 初任給（固定残業代込み）
  - 算出初任基本給
  - 固定残業時間
  - 年間休日数
  - ボーナス設定
  - 給与成長率
  - 勤務都道府県 / 業種
  - 扶養・前年度収入
  - 手当（件数・合計固定額）
- セクション2: 年次比較テーブル（1〜N年）
  - 年ごとにシナリオ別で以下を掲載
  - 額面年収 / 手取り年収 / 控除合計 / 平均月収(手取り)
- セクション3: 成長指標サマリ（シナリオ別）
  - Year1 → YearN の増加額（額面/手取り）
  - Year1 → YearN の増加率（額面/手取り）
  - CAGR（額面/手取り）
  - 指定年までの累計額面 / 累計手取り
- セクション4: シナリオ別詳細
  - 各シナリオごとに年次内訳表（1〜N年）
  - 収入内訳: 基本給・固定残業代・変動残業代・手当・ボーナス
  - 控除内訳: 健康保険・厚生年金・雇用保険・所得税・復興特別所得税・住民税
- セクション5: 税制・計算前提
  - 使用税制スキーマバージョン
  - 主要税率（住民税率、復興特別所得税率、社会保険率の適用キー）
  - 注記（丸め規則、住民税前年基準など）

## 5. 生成方式（技術仕様）

- 推奨方式: Mainプロセスで `BrowserWindow.webContents.printToPDF` を使用
- 手順:
  1. Mainで対象シナリオと設定を受領
  2. `calculatePrediction` を各シナリオに実行して比較用DTOを構築
  3. 隠しウィンドウに専用レポートHTMLを描画
  4. `printToPDF` でPDFバイナリ生成
  5. `showSaveDialog` の保存先へ書き込み
- 理由:
  - Electron標準APIで完結し依存追加を最小化
  - 日本語フォントと表組みの再現性が高い

## 6. IPC / 型仕様

- 追加IPC:
  - `export-scenario-comparison-pdf`
- Preload API:
  - `exportScenarioComparisonPdf(payload)` を追加
- リクエスト型:

```ts
export type ScenarioComparisonPdfExportRequest = {
  scenarioIds: string[]
  untilYear: number
  averageOvertimeHours: number
  includeSections: {
    conditions: boolean
    yearlyComparison: boolean
    growthSummary: boolean
    scenarioDetails: boolean
    taxMeta: boolean
  }
}
```

- レスポンス型:

```ts
export type ScenarioComparisonPdfExportResponse = {
  success: boolean
  filePath?: string
  pageCount?: number
  warnings?: string[]
  error?: string
}
```

## 7. バリデーション

- `scenarioIds.length >= 2`
- `untilYear` は 1〜50
- 対象シナリオが全て存在し `scenarioSchema` を通過
- 各シナリオの計算が成功すること
- 1件でも計算失敗なら export 全体を失敗として返す

## 8. エラー表示仕様

- 失敗時はトーストで理由を表示
- 主なエラー:
  - 比較対象不足（2件未満）
  - 年数不正
  - 計算失敗（シナリオ名付き）
  - 保存キャンセル
  - ファイル書き込み失敗

## 9. ファイル命名規則

- 既定ファイル名:
  - `scenario_comparison_{YYYYMMDD_HHmmss}_{N}scenarios_Y{untilYear}.pdf`
- 例:
  - `scenario_comparison_20260327_203500_3scenarios_Y10.pdf`

## 10. 非機能要件

- 性能目標:
  - シナリオ5件・10年で 5秒以内に生成開始
  - シナリオ10件・30年で 15秒以内を目安
- 安定性:
  - 生成失敗時もアプリは継続利用可能
- 再現性:
  - 生成時に使用した税制スキーマバージョンをPDFへ埋め込み

## 11. 受け入れ基準

- 複数選択したシナリオでPDFエクスポートできる。
- 指定年（N年目）までの年次データが全シナリオ分掲載される。
- シナリオ条件と成長指標（増加額・増加率・CAGR・累計）が掲載される。
- 税制スキーマ情報が掲載される。
- 不正条件時にエクスポートボタンが抑止されるか、明確なエラーが返る。

