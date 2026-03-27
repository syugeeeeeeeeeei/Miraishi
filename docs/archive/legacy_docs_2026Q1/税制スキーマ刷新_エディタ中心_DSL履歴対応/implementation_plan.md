# 実装計画

## 1. スキーマ刷新基盤

- `TaxSchema` を `TaxSchemaV1 | TaxSchemaV2` の union 受理に変更。
- 起動時に保存済みスキーマを正規化し、内部では `TaxSchemaV2` として扱う。
- `defaultTaxSchemaV2()` と `migrateTaxSchemaV1ToV2()` を共通モジュール化する。

## 2. 構造束縛と検証強化

- Zod strict で未知プロパティを拒否。
- 税率/金額の範囲と税率帯の昇順を検証。
- `SchemaValidationReport` を返す preview/apply フローを実装。

## 3. DSL 化された計算基盤

- 許可ノード限定の AST コンパイラを実装。
- 未定義変数、必須step欠落、重複step、循環依存をコンパイル時に拒否。
- 計算はコンパイル済み AST のみ評価する。

## 4. 履歴・復元・差分

- `taxSchemaState`（active + snapshots + legacyBackups）を `electron-store` へ保存。
- 適用時にスナップショットを追記し、履歴上限100件を維持。
- 履歴一覧・復元・差分（JSON Pointer）IPC を提供。

## 5. UI再設計

- 税制ダイアログを「YAML Editor + 確認画面 + 履歴復元」に統一。
- フォームモードを撤廃。
- シナリオ画面に `taxProfile` 入力を追加し、変更時再計算を行う。

## 6. 検証

- 型検査: `yarn typecheck`
- テスト: `yarn test --run`
- 新規テスト: engine/validators/schemaDiff/calculator
