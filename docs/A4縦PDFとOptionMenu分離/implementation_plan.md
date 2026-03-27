# 実装計画

1. `src/main/lib/scenarioComparisonPdf.ts` の `@page` 設定を A4 portrait に変更し、ページ高さ基準のレイアウト値を縦向きに合わせて調整する。
2. `OptionMenu` ディレクトリを新設し、以下を移設する。
   - `SystemRadialMenu`
   - `TaxRuleDialog`
   - `ScenarioComparisonPdfDialog`
3. `OptionMenu/index.tsx` を新規作成し、ラジアルメニュー表示と各ダイアログ表示を担当させる。
4. `ControlPanel/index.tsx` からメニュー構築/ダイアログ描画を除去し、`OptionMenu` 呼び出しへ置き換える。
5. `yarn typecheck` と `yarn test --run` で回帰確認する。
