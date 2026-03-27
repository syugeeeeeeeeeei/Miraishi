# 修正内容の確認

## 変更概要

- PDF出力を A4 縦向きに変更。
- オプションメニュー関連を `ControlPanel` から分離し、`OptionMenu` 配下へ集約。
- メニューごとにディレクトリを切って整理。

## 変更ファイル

- `src/main/lib/scenarioComparisonPdf.ts`
  - `@page size` を `A4 portrait` に変更
  - スライド高さを縦向き基準に変更
  - カバー情報グリッドを2カラム化

- `src/renderer/src/components/OptionMenu/index.tsx`（新規）
  - オプションメニュー表示の集約コンポーネントを追加

- `src/renderer/src/components/OptionMenu/SystemMenu/SystemRadialMenu.tsx`
  - `SystemRadialMenuItem` 型を export 化

- `src/renderer/src/components/OptionMenu/TaxRuleMenu/TaxRuleDialog.tsx`
  - `ControlPanel` から移設

- `src/renderer/src/components/OptionMenu/ScenarioComparisonPdfMenu/ScenarioComparisonPdfDialog.tsx`
  - `ControlPanel` から移設

- `src/renderer/src/components/ControlPanel/index.tsx`
  - メニュー構築と各ダイアログ描画を削除
  - `OptionMenu` を利用する構成へ変更

## 検証

- `yarn typecheck` 成功
- `yarn test --run` 成功（22 tests passed）
