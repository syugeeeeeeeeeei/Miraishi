# 修正内容の確認

## 1. フォントサイズ拡大
- YAML エディター全体のフォントサイズを `15px` に変更。

## 2. 文字幅と行間の調整
- `.cm-content` に `letterSpacing: 0.02em` を追加して字間を拡大。
- `.cm-scroller` の `lineHeight` を `1.8` に調整。

## 3. 行番号領域の調整
- `.cm-gutters` のフォントサイズを `14px` に変更して本文とのバランスを調整。

## 4. 検証
- `yarn typecheck:web`: 成功
- `yarn typecheck:node`: 成功
