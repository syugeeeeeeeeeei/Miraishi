# 実装計画

## 方針
- 影響範囲を `TaxRuleDialog` のレイアウト調整に限定し、税金ルール編集ロジックや保存処理には変更を入れない。
- 上余白は Chakra UI のデフォルトパディング由来の可能性が高いため、`ModalBody` と `TabPanel` の上パディングを明示的に制御する。

## 実装ステップ
1. `ModalBody` の `pt` を `0` にして、ヘッダー直下の余白を除去する。
2. 既存のレイアウトバランス維持のため `px` / `pb` を明示する。
3. `TabList` の背景色をグレー系に変更し、境界線色も調整する。
4. `TabPanel` の `pt` を `0` にして、タブ直下の不要な上余白を抑える。
5. `yarn typecheck` で型チェックを行う。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
