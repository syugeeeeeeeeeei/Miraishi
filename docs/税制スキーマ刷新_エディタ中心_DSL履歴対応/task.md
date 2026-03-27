# タスクリスト

- [x] `TaxSchemaV2` の型・デフォルト・V1移行を追加
- [x] バリデーションを strict 化（未知キー拒否、範囲チェック、閾値順序チェック）
- [x] 制限DSL（AST）コンパイラ/評価器を実装（`eval/new Function` 不使用）
- [x] 計算エンジンを `CompiledTaxSchemaV2` ベースに置換
- [x] `preview-tax-schema` / `apply-tax-schema` / 履歴・復元・差分 IPC を追加
- [x] `get/update-tax-schema` 互換エイリアスを維持
- [x] `TaxRuleDialog` を Editor + 確認画面 + 履歴復元UI に再構成（フォーム廃止）
- [x] `Scenario.taxProfile`（都道府県/業種）を追加し、入力UIと再計算を接続
- [x] 復興特別所得税を計算/表示に追加
- [x] ユニットテストを拡張（DSL/validator/diff/calculator）
- [x] `yarn typecheck` / `yarn test --run` で成立確認
