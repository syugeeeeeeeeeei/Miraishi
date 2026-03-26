# 実装計画

## 1. 根因調査

- ソース文字列のエンコード不整合を確認
- フォント定義と適用経路（テーマ/コンポーネント）を確認

## 2. 修正方針

- Chakra テーマの `fonts.body` / `fonts.heading` を定義し、`Heading` を含む全体へ日本語フォントを適用
- `@fontsource` は全サブセット読み込みから `japanese-*` に切り替え、環境依存性を低減

## 3. 確認

- `yarn typecheck`
- `yarn test`
- `yarn build`

で回帰がないことを確認する。
