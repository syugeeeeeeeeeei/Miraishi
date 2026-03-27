# 実装計画

## 方針
- 機能は維持し、見た目のみを最小差分で調整する。
- フォントは `var(--chakra-fonts-body)` 優先に戻して日本語表示の安定性を優先する。
- スペース表示は高コントラストの青丸から、低彩度・低濃度の薄いドットに変更する。

## 実装ステップ
1. YAMLエディターのフォントスタックを `var(--chakra-fonts-body)` 優先へ変更。
2. `.cm-highlightSpace` を薄いグレー系ドット（小サイズ）へ調整。
3. `.cm-highlightTab` の矢印色を低彩度化して主張を下げる。
4. ヘッダーの赤・黄・緑マークを削除。
5. `yarn typecheck:web` / `yarn typecheck:node` で確認。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_見た目微調整_フォントと空白ドット/task.md`
- `docs/yamlエディター_見た目微調整_フォントと空白ドット/implementation_plan.md`
- `docs/yamlエディター_見た目微調整_フォントと空白ドット/walkthrough.md`
