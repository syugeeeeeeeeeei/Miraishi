# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 複数シナリオ比較PDFエクスポート機能を実装した。
- Main側に `export-scenario-comparison-pdf` を追加し、
  - 入力検証
  - 対象シナリオ再計算
  - 比較レポートHTML生成
  - `printToPDF` 実行
  - 保存ダイアログとファイル書き込み
  を一連で実装した。
- Renderer側にPDFエクスポート設定ダイアログを追加し、シナリオ選択・年数・残業時間・セクション指定を可能にした。
- システムラジアルメニューからPDF出力を起動できるようにした。

## 主な変更ファイル

- `src/types/miraishi.d.ts`
- `src/preload/index.ts`
- `src/main/index.ts`
- `src/main/lib/scenarioComparisonPdf.ts`（新規）
- `src/renderer/src/components/ControlPanel/ScenarioComparisonPdfDialog.tsx`（新規）
- `src/renderer/src/components/ControlPanel/index.tsx`

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）

## 補足

- PDF生成は Electron 標準の `printToPDF` を使用。
- 保存先は保存ダイアログで指定。
- 保存キャンセル時は失敗レスポンス（キャンセルメッセージ）を返す。
