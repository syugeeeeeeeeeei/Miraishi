# 実装計画

## 1. 差分確認

- `resources/schema/tax_schema.yaml` と `resources/schema/tax_schema_with_meta.yaml` を比較し、内容が一致しているか確認する。

## 2. 利用状況確認

- コードベース全体を検索し、どちらのファイルが実運用で参照されているか確認する。

## 3. 削除

- 内容が重複し、実運用で未使用のファイルを削除する。
