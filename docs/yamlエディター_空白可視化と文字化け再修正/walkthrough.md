# 修正内容の確認

## 1. 文字化け対策（フォント見直し）
- YAML エディターのフォントを、`var(--chakra-fonts-body)` 優先のスタックへ変更。
- 日本語表示に強い UI フォント群を優先し、WSL GUI での文字化け発生を抑える構成にした。

## 2. 空白可視化の追加
- CodeMirror 拡張に以下を追加。
  - `highlightWhitespace()`
  - `highlightTrailingWhitespace()`
- これにより、スペース・タブ・行末空白がエディター上で視認可能になった。

## 3. 視認スタイル調整
- `.cm-highlightSpace` / `.cm-highlightTab` / `.cm-trailingSpace` の背景色を設定し、インデント差分を見分けやすくした。

## 4. 補助文言更新
- エディター下部の説明を、空白可視化（スペース/タブ/行末空白）前提の文言に更新。

## 5. 検証
- `yarn typecheck:web`: 成功
- `yarn typecheck:node`: 成功
