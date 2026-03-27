# 修正内容の確認

## 1. 税制ルールファイルの YAML 化
- `resources/schema/tax_schema.yaml` を新規追加。
- 所得税率テーブルや社会保険設定を YAML へ移植。
- コメントを追加できるよう、YAML 形式で管理可能にした。
- 旧 `resources/schema/tax_schema.json` は削除。

## 2. Main の読み込み処理を YAML 対応
- `src/main/index.ts` で `yaml` パッケージを利用してパースするよう変更。
- `loadBundledTaxSchema` を追加し、以下の順で読み込み:
  1. `tax_schema.yaml`（優先）
  2. `tax_schema.json`（互換フォールバック）
- パース後は従来通り `taxSchemaSchema`（Zod）で検証してから利用。

## 3. ドキュメント更新
- `README.md` の税制ルール参照先を `resources/schema/tax_schema.yaml` に変更。

## 4. 検証
- `yarn typecheck:node` を実行し、main 側の型チェック通過を確認。
