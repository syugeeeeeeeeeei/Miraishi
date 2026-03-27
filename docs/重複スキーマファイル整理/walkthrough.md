# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- `tax_schema.yaml` と `tax_schema_with_meta.yaml` は差分がなく、内容が完全一致していることを確認した。
- 実際にアプリ起動時に読み込まれているのは `src/main/index.ts` の `tax_schema.yaml` のみであることを確認した。
- 重複していた `resources/schema/tax_schema_with_meta.yaml` を削除した。

## 主な変更ファイル

- `resources/schema/tax_schema_with_meta.yaml`（削除）

## 確認結果

- `resources/schema` には `tax_schema.yaml` のみ残っている。
