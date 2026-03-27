# 実装計画

## 1. 問題

- フォント埋め込み後のHTMLサイズが大きくなり、`data:` URL が長大化して `ERR_INVALID_URL` が発生していた。

## 2. 対策

- PDF生成時のHTML投入方法を `data URL` から `temp file + loadFile` に変更する。
- 生成後は一時HTMLを削除してクリーンアップする。

## 3. 検証

- `yarn typecheck`
- `yarn test --run`
