# 実装計画

## 方針
- `.cm-highlightSpace` の背景繰り返し間隔のみを調整し、最小変更で見た目を改善する。
- 機能ロジックや他スタイルは触らず、可視化ドットの密度だけを下げる。

## 実装ステップ
1. `TaxRuleDialog` の `.cm-highlightSpace` で `backgroundSize` を拡大する。
2. `yarn typecheck:web` / `yarn typecheck:node` で型検証する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_スペース間隔調整/task.md`
- `docs/yamlエディター_スペース間隔調整/implementation_plan.md`
- `docs/yamlエディター_スペース間隔調整/walkthrough.md`
