# 実装計画

## 方針
- `TaxRuleDialog` のテキスト編集処理を JSON パースから YAML パースへ置換する。
- エディタ表示文字列は、コメント付きの YAML 文字列を生成するヘルパーで一元管理する。
- UI文言を YAML ベースに統一して、利用者の混乱を防ぐ。

## 実装ステップ
1. `yaml` パッケージの `parseDocument` を `TaxRuleDialog` に導入する。
2. `parseTaxSchemaFromText` を YAML パース + 既存型バリデーションへ変更する。
3. `toTaxSchemaYamlText` を追加し、税率説明や項目説明コメント付きで YAML 文字列を生成する。
4. 初期化処理とフォーム編集時の `setEditorText` をコメント付き YAML 出力へ置換する。
5. タブ名・入力ラベル・補助文言を JSON から YAML に変更する。
6. `yarn typecheck:web` と `yarn typecheck:node` で検証する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/税制ルール設定_yaml編集対応/task.md`
- `docs/税制ルール設定_yaml編集対応/implementation_plan.md`
- `docs/税制ルール設定_yaml編集対応/walkthrough.md`
