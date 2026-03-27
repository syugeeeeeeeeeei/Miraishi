# 修正内容の確認

## 変更ファイル

- `src/main/lib/scenarioComparisonPdf.ts`

## 主要変更

- `renderAnnualDetailCard` を拡張し、前年度比セクションを追加。
  - 額面 前年比: 増加額 / 増加率
  - 手取 前年比: 増加額 / 増加率
- 1年目や前年度不在時は `-` 表示。
- 増減の符号に応じた色分けを追加。
  - 増加: 緑
  - 減少: 赤
- `renderAnnualDetailCardsPage` に `allDetails` を追加し、
  - 年度→詳細のマップを作成
  - 各カードへ前年度データを正しく渡す

## 検証

- `yarn typecheck` 成功
- `yarn test --run` 成功（22 tests passed）
