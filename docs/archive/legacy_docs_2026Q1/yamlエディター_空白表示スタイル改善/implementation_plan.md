# 実装計画

## 方針
- 空白表示は背景色ベタ塗りから、記号ベース（スペース: 点、タブ: 矢印）へ変更する。
- フォントは ASCII 部分が等幅になりやすいスタックを優先し、インデントの横幅感を安定させる。
- 既存の CodeMirror 拡張（`highlightWhitespace` / `highlightTrailingWhitespace`）を活かし、テーマ上書きで見た目のみ改善する。

## 実装ステップ
1. YAML エディターのフォントスタックを `ui-monospace` 優先に変更。
2. `.cm-highlightSpace` を青ドット（radial gradient）表示へ変更。
3. `.cm-highlightTab` を青矢印 SVG 表示へ変更し、`minWidth: 2ch` で潰れを抑制。
4. `.cm-trailingSpace` の赤帯コントラストを強化。
5. 補助文言を新表示ルール（青点/青矢印/赤帯）に更新。
6. `yarn typecheck:web` / `yarn typecheck:node` で確認。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `docs/yamlエディター_空白表示スタイル改善/task.md`
- `docs/yamlエディター_空白表示スタイル改善/implementation_plan.md`
- `docs/yamlエディター_空白表示スタイル改善/walkthrough.md`
