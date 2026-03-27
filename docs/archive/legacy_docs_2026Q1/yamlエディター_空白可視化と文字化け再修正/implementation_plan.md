# 実装計画

## 方針
- フォントは日本語表示実績のある Chakra の `body` フォントスタックを優先して、WSL 環境での文字化けリスクを下げる。
- CodeMirror の既存拡張（`highlightWhitespace` / `highlightTrailingWhitespace`）を利用し、空白可視化を実現する。

## 実装ステップ
1. `TaxRuleDialog` の YAML エディタ用フォント定数を `var(--chakra-fonts-body)` 優先に変更する。
2. `@codemirror/view` から `highlightWhitespace` と `highlightTrailingWhitespace` を追加 import する。
3. YAML エディタ拡張に空白可視化拡張を追加する。
4. `.cm-highlightSpace` / `.cm-highlightTab` / `.cm-trailingSpace` のテーマスタイルを調整して視認性を上げる。
5. エディター下部説明文を空白可視化に合わせて更新する。
6. `yarn typecheck:web` / `yarn typecheck:node` で検証する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_空白可視化と文字化け再修正/task.md`
- `docs/yamlエディター_空白可視化と文字化け再修正/implementation_plan.md`
- `docs/yamlエディター_空白可視化と文字化け再修正/walkthrough.md`
