# 実装計画

## 方針
- 文字化けの主因をエディターのフォント指定とみなし、YAMLエディターの `Textarea` フォントを日本語表示に強い `body` フォントへ切り替える。
- ロジックには手を入れず、表示部分のみ最小差分で修正する。

## 実装ステップ
1. `TaxRuleDialog` のYAMLエディター `Textarea` の `fontFamily` を `mono` から `body` に変更。
2. `yarn typecheck:web` / `yarn typecheck:node` を実行し、型エラーがないことを確認。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター文字化け修正/task.md`
- `docs/yamlエディター文字化け修正/implementation_plan.md`
- `docs/yamlエディター文字化け修正/walkthrough.md`
