# 修正内容の確認

## 1. 税制ルールエディタを YAML 化
- `TaxRuleDialog` のテキストパースを `JSON.parse` から `parseDocument`（YAML）へ変更。
- YAML構文エラー時は先頭エラー内容をメッセージとして表示。
- パース成功後は既存の `TaxSchema` 構造チェックを継続利用。

## 2. コメント付き YAML を生成
- `toTaxSchemaYamlText` を追加し、以下のコメントを自動付与するようにした。
  - 税率表の `threshold` の意味（`null` は上限なし）
  - `rate` の小数表現（`0.1 = 10%`）
  - 社会保険の上限値項目の意味
  - 控除額が年間金額であること
- ダイアログ初期表示とフォーム編集反映時は、常にこのコメント付き YAML を表示。

## 3. UI文言の更新
- タブ名: `JSONエディットモード` → `YAMLエディットモード`
- ラベル: `税金ルールJSON` → `税金ルールYAML`
- 補助文言・エラー文言を YAML 基準に変更。

## 4. 検証
- `yarn typecheck:web` 実行: 成功
- `yarn typecheck:node` 実行: 成功
