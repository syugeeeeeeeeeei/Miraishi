# 実装計画

## 方針
- CodeMirror のテーマ設定のみを変更し、機能ロジックには影響を与えない。
- 文字サイズ、字間、行間、ガター文字サイズを調整して読みやすさを上げる。

## 実装ステップ
1. `yamlEditorTheme` の全体フォントサイズを 13px から 15px へ変更する。
2. `.cm-scroller` の行間を 1.7 から 1.8 へ調整する。
3. `.cm-content` に `letterSpacing` を追加して字間を広げる。
4. `.cm-gutters` の文字サイズを 14px に調整する。
5. `yarn typecheck:web` / `yarn typecheck:node` で検証する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_文字幅と文字サイズ拡大/task.md`
- `docs/yamlエディター_文字幅と文字サイズ拡大/implementation_plan.md`
- `docs/yamlエディター_文字幅と文字サイズ拡大/walkthrough.md`
