# 実装計画

## 1. ルール項目メタの網羅化

- 既存の `uiMeta.items` を拡張し、`rules` 配下の主要ノード/葉ノードをすべて定義する。
- 各項目に `name`, `description`, `formulaStepIds` を設定する。

## 2. デフォルトスキーマ更新

- `defaultTaxSchemaV2` のメタ定義を新構成に合わせる。
- バージョンを `2026.2.0` へ更新する。

## 3. 新仕様YAMLの作成・適用

- `resources/schema/tax_schema.yaml` を V2 形式へ差し替える。
- 文字式DSLの `formula.steps` と `uiMeta.items` を含める。
- 都道府県別料率マップを含む網羅構成にする。

## 4. 検証

- YAMLパース確認
- `yarn typecheck`
- `yarn test --run`
