# 修正内容の確認

## 変更ファイル

- `src/main/lib/scenarioComparisonPdf.ts`

## 主要変更

- `renderTaxBreakdownCell` を更新し、税金内訳を以下の表示へ変更。
  - 横方向の色棒グラフ（所得税/復興税/住民税の構成比）
  - 税合計金額
  - 税目ごとの凡例、金額、構成比
- テーブルCSSを追加・調整。
  - `tax-color-bar`
  - `tax-segment-*`
  - `tax-breakdown-legend`
  - `tax-dot`

## 検証

- `yarn typecheck` 成功
- `yarn test --run` 成功（22 tests passed）
