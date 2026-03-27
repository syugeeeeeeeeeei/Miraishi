# タスク

## 依頼内容
- 現在の独自スペース可視化スタイルを一度削除する。
- CodeMirror 公式ドキュメント記載の `highlightWhitespace()` デフォルト表示（空白は薄い点、タブは矢印）に準拠する。

## 完了条件
1. `highlightWhitespace()` は有効だが、`.cm-highlightSpace` / `.cm-highlightTab` の独自上書きがない。
2. trailing space 用の独自強調も解除されている。
3. UI文言がデフォルト利用に合わせて更新されている。
4. 型チェックが通る。
