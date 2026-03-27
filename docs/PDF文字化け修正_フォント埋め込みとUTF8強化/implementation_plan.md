# 実装計画

## 1. 原因対策

- PDF生成時の文字化け再発を抑止するため、
  - HTML投入を `data:text/html;base64,...` に変更
  - 日本語フォントをPDF用HTMLへ埋め込み
  を同時に実施する。

## 2. フォント埋め込み

- Mainプロセスで `@fontsource` の日本語 `woff2` を読み込み、`@font-face` の data URI を組み立てる。
- レポートHTML生成関数へ埋め込みCSSを渡し、PDF描画で優先使用させる。

## 3. 検証

- 型チェック
- 既存テスト
