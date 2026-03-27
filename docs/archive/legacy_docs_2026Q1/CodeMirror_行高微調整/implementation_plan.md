# 実装計画

## 方針
- 行高設定のみを最小差分で変更し、その他の見た目・機能には影響を与えない。

## 実装ステップ
1. `TaxRuleDialog` の CodeMirror テーマ（`.cm-scroller`）の `lineHeight` を微調整する。
2. `yarn typecheck:web` / `yarn typecheck:node` を実行して確認する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/CodeMirror_行高微調整/task.md`
- `docs/CodeMirror_行高微調整/implementation_plan.md`
- `docs/CodeMirror_行高微調整/walkthrough.md`
