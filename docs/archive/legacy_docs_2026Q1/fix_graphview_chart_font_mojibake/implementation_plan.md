# 実装計画

## 1. 原因絞り込み

- GraphView の文字化け対象（グラフタイトル/凡例）が canvas 描画であることを確認。
- 通常DOMテキストではなく Chart.js のフォント設定が効く経路であることを確認。

## 2. 修正

- Chart.js のグローバル既定フォントを日本語フォントスタックに設定。
- GraphView の `options` で `title` / `legend` / `ticks` のフォントを明示。
- `document.fonts.ready` 完了までチャート描画を待機。

## 3. 検証

- `yarn typecheck`
- `yarn test`
- `yarn build`
