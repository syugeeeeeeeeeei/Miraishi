# 実装計画

## 方針
- YAMLエディターの視認性を上げるため、フォント・行間・背景ガイド線を調整する。
- YAML出力の整形ルールを改善し、セクション見出しコメントと空行でブロック境界を明確化する。

## 実装ステップ
1. `TaxRuleDialog` に日本語フォールバック付き等幅フォントスタック定数を追加する。
2. `Textarea` に行間・文字間隔・2文字単位の縦ガイド線背景を適用する。
3. `toTaxSchemaYamlText` を更新し、セクション見出しコメントと空行を追加する。
4. 所得税率テーブルの各段にコメント（N段目）を付与する。
5. 補助文言に「スペース2つインデント」を追記する。
6. `yarn typecheck:web` / `yarn typecheck:node` で確認する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_可読性改善/task.md`
- `docs/yamlエディター_可読性改善/implementation_plan.md`
- `docs/yamlエディター_可読性改善/walkthrough.md`
