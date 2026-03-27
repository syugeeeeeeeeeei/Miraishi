# 修正内容の確認

## 1. YAMLエディターのフォント修正
- `TaxRuleDialog` のYAML `Textarea` の `fontFamily` を `mono` から `body` へ変更。
- 日本語フォントを含むアプリ標準フォントスタックを使うことで、文字化けを抑止。

## 2. 既存機能への影響
- YAMLパース・バリデーション・保存ロジックには変更なし。
- 表示レイヤーのみの修正のため、機能的な挙動は維持。

## 3. 検証
- `yarn typecheck:web`: 成功
- `yarn typecheck:node`: 成功
