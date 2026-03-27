# 修正内容の確認

## 1. リッチエディターへの置換
- YAML編集UIを `Textarea` から CodeMirror 6 へ変更。
- 行番号、折りたたみガター、アクティブ行ハイライト、括弧対応などを有効化。

## 2. 赤波線（スペルチェック）対策
- `EditorView.contentAttributes` で以下を無効化。
  - `spellcheck: false`
  - `autocorrect: off`
  - `autocapitalize: off`
  - `data-gramm: false`
- これによりブラウザ/拡張機能由来の校正表示が出にくい構成に変更。

## 3. 可読性改善
- 日本語フォールバック付き等幅フォントを適用。
- ガター背景、アクティブ行色、フォーカス枠などを調整して構造追従性を向上。

## 4. 検証
- `yarn typecheck:web`: 成功
- `yarn typecheck:node`: 成功
