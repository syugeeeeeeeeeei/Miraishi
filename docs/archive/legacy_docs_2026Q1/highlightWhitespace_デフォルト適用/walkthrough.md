# 修正内容の確認

## 1. 公式デフォルトへの切り戻し
- `highlightWhitespace()` は維持。
- `highlightTrailingWhitespace()` は削除。
- `.cm-highlightSpace` / `.cm-highlightTab` / `.cm-trailingSpace` のテーマ上書きを削除し、CodeMirror標準表示に戻した。

## 2. UI文言更新
- エディター下部の説明を、`highlightWhitespace()` のデフォルト表示利用に合わせて変更。

## 3. 検証
- `yarn typecheck:web`: 成功
- `yarn typecheck:node`: 成功
