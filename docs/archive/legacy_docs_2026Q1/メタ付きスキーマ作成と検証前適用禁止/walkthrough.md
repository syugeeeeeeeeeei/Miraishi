# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- `resources/schema/tax_schema_with_meta.yaml` を新規追加した。
  - 内容は V2 新仕様（`schemaVersion: 2.0`）
  - 文字式DSLの `formula.steps` を含む
  - `uiMeta.items` に `name/description` を含む
- `TaxRuleDialog` で「変更を適用」ボタンを検証完了まで無効化した。
- エディタ内容を変更したら検証結果をリセットし、再検証を必須化した。

## 主な変更ファイル

- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `resources/schema/tax_schema_with_meta.yaml`

## 実行結果

- YAMLパース: 成功（`schemaVersion=2.0`, `version=2026.2.0`, `uiMeta.items=22`）
- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
