# 実装計画

## 方針
- 既存の YAML エディター機能は維持し、空白可視化のスタイルだけを公式デフォルトへ戻す。
- `highlightWhitespace()` のみを利用し、関連する独自CSS上書きは削除する。

## 実装ステップ
1. `@codemirror/view` の import から `highlightTrailingWhitespace` を削除する。
2. `yamlEditorExtensions` から `highlightTrailingWhitespace()` を削除する。
3. `yamlEditorTheme` 内の `.cm-highlightSpace` / `.cm-highlightTab` / `.cm-trailingSpace` の独自スタイルを削除する。
4. 補助文言を「`highlightWhitespace()` のデフォルト表示利用」に更新する。
5. `yarn typecheck:web` / `yarn typecheck:node` を実行する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/highlightWhitespace_デフォルト適用/task.md`
- `docs/highlightWhitespace_デフォルト適用/implementation_plan.md`
- `docs/highlightWhitespace_デフォルト適用/walkthrough.md`
