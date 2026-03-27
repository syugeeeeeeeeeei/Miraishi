# 修正内容の確認

## 変更ファイル

- `src/main/lib/scenarioComparisonPdf.ts`

## 主要変更

- 年度詳細表示をテーブルからカードUIへ全面置換。
- `renderAnnualDetailCard` を追加し、各年度を独立カードで表示。
- `renderTaxBreakdownCardGraph` を追加し、税金内訳を色棒グラフで可視化。
- `splitAnnualDetailsInTwoPages` と `renderAnnualDetailCardsPage` を追加し、
  - シナリオごとに年度詳細を2ページで表示
  - ページごとの年度範囲を明示
- サマリースライドでは「年度詳細は続く2ページで表示」案内へ変更。
- カードUI用スタイルを追加（モダンカード、色棒グラフ、凡例）。

## 検証

- `yarn typecheck` 成功
- `yarn test --run` 成功（22 tests passed）
