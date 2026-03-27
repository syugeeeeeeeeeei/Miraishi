# 実装計画

## 方針
- CodeMirror は維持しつつ、周辺UIを再設計してモダンな編集体験へ寄せる。
- 見た目改善はテーマ（配色/行/ガター/カーソル/トークン色）と、ツールバー付きコンテナで実装する。
- 既存の編集ロジックはそのまま活かし、`フォーマット` ボタンのみ追加する。

## 実装ステップ
1. CodeMirror テーマの配色を再設計し、ライト基調でコントラストを最適化する。
2. エディター行の余白・行間・カーソル色・トークン色（コメント/文字列/数値/キー）を調整する。
3. YAMLタブにモダンなカードコンテナと上部ツールバーを追加する。
4. ツールバーに `YAML` / `2 spaces` / 構文状態バッジを表示する。
5. `フォーマット` ボタンを追加し、現在の draft からコメント付き YAML を再生成できるようにする。
6. `yarn typecheck:web` / `yarn typecheck:node` で検証する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_モダンUI化/task.md`
- `docs/yamlエディター_モダンUI化/implementation_plan.md`
- `docs/yamlエディター_モダンUI化/walkthrough.md`
