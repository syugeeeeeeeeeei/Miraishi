# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- PDF出力HTMLのロード方式を `charset=utf-8` のURLエンコード方式から `base64` 方式へ変更した。
- PDFレポートに日本語フォントを埋め込む仕組みを追加した。
  - `Zen Maru Gothic` (400/700)
  - `M PLUS Rounded 1c` (400/700)
- HTML生成側で埋め込みフォントCSSを受け取れるように拡張した。

## 主な変更ファイル

- `src/main/index.ts`
- `src/main/lib/scenarioComparisonPdf.ts`

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）

## 補足

- フォント埋め込みに失敗した場合も、既存のシステムフォントへフォールバックする。
