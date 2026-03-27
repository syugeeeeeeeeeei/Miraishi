# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 確認画面のアコーディオン項目定義から `formula.steps` を除外した。
- `resources/schema/tax_schema.yaml` / `resources/schema/tax_schema_with_meta.yaml` の `uiMeta.items` から `formula.steps` を削除した。
- 配列プレビュー文言を `N 件の配列` から `N件（配列）` に変更した。
- 未設定時メッセージを `関連づく計算式は未設定です。` から `関連する計算式は未設定です。` に変更した。

## 主な変更ファイル

- `src/shared/taxSchemaDefaults.ts`
- `resources/schema/tax_schema.yaml`
- `resources/schema/tax_schema_with_meta.yaml`
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
