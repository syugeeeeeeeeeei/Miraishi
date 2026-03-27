# 実装計画

## 方針
- UIコンポーネントの再配置とスタイル調整に集中し、機能追加は最小限に留める。
- バッジ多用をやめ、ヘッダーをシンプルにして余白と配色でモダンさを出す。
- エディターコンテナはグラデーション枠 + 内側カードで質感を高める。

## 実装ステップ
1. YAMLタブのラベル行を再設計し、`フォーマット` ボタンをゴーストスタイル化。
2. カードコンテナの外枠を `bgGradient` + シャドウで調整。
3. 上部ヘッダーをミニマル化（3ドット + YAML EDITOR + 構文ステータス）
4. 既存の CodeMirror 設定は維持し、見た目だけを変更。
5. `yarn typecheck:web` / `yarn typecheck:node` で検証。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_モダン見た目再調整/task.md`
- `docs/yamlエディター_モダン見た目再調整/implementation_plan.md`
- `docs/yamlエディター_モダン見た目再調整/walkthrough.md`
