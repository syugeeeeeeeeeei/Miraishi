# 実装計画

## 方針
- `Textarea` を廃止し、CodeMirror 6（`@uiw/react-codemirror`）へ置き換える。
- YAML言語拡張を導入し、構文ハイライト・インデント支援・折りたたみで可読性を上げる。
- エディターの content 属性で spellcheck/correct を明示的に無効化し、赤波線を抑止する。

## 実装ステップ
1. 依存関係として `@uiw/react-codemirror` / `@codemirror/lang-yaml` / `@codemirror/view` を追加。
2. `TaxRuleDialog` の `Textarea` import を削除し、CodeMirror関連 import に置換。
3. YAML用 extensions を定義し、`spellcheck: false` などを `contentAttributes` で設定。
4. エディターの見た目（ガター、アクティブ行、フォーカス時ボーダー）を `EditorView.theme` で調整。
5. YAMLタブの入力UIを `CodeMirror` コンポーネントへ置換。
6. `yarn typecheck:web` / `yarn typecheck:node` で確認。

## 影響範囲
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `package.json`
- `yarn.lock`
- `docs/yamlリッチエディター導入/task.md`
- `docs/yamlリッチエディター導入/implementation_plan.md`
- `docs/yamlリッチエディター導入/walkthrough.md`
