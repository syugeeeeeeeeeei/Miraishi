# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 税制スキーマの `uiMeta.items` を全ルール項目へ拡張した。
- 健康保険・厚生年金・雇用保険・控除の各項目について、個別の `name/description` と関連計算式IDを付与した。
- `resources/schema/tax_schema.yaml` を V2 新仕様（文字式DSL + 項目メタ）へ更新した。

## 主な変更ファイル

- `src/shared/taxSchemaDefaults.ts`
- `resources/schema/tax_schema.yaml`

## 適用状態

- バンドル既定スキーマ（`resources/schema/tax_schema.yaml`）を新仕様へ置換済み。
- アプリ起動時に新仕様ファイルを読み込める状態。

## 実行結果

- YAMLパース: 成功（`schemaVersion=2.0`, `uiMeta.items=22`）
- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
