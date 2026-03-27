# 実装計画

## 方針
- 既存機能への影響を最小化するため、`SystemRadialMenu` の責務を「メニュー表示」に限定し、配置責務は `ControlPanel` 側で持つ。
- 税金ルールダイアログでは、タブヘッダーの視認性と操作性のみを改善し、既存のフォーム・JSON編集ロジックには手を入れない。

## 実装ステップ
1. `ControlPanel` から `SystemRadialMenu` の埋め込み位置を削除する。
2. `ControlPanel` のルート直下に固定配置コンテナ（`position: fixed`）を追加し、`SystemRadialMenu` をフローティング表示する。
3. `SystemRadialMenu` の props を整理し、パネル開閉状態依存を取り除く。
4. `TaxRuleDialog` の `TabList` に背景・枠線・影を設定し、背景同化を防ぐ。
5. `TaxRuleDialog` の `TabList` を `position: sticky` で固定し、スクロール時も操作可能にする。
6. `yarn typecheck` を実行して型安全性を確認する。

## 影響範囲
- `src/renderer/src/components/ControlPanel/index.tsx`
- `src/renderer/src/components/ControlPanel/SystemRadialMenu.tsx`
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
