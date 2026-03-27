# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- `createPdfBufferFromHtml` のHTML読み込み方式を `data:text/html;base64,...` から `loadFile` へ変更した。
- Mainプロセスで一時HTMLファイルを `temp` 配下に作成し、読み込み後に削除する処理を追加した。
- これにより URL長制限起因の `ERR_INVALID_URL` を回避した。

## 主な変更ファイル

- `src/main/index.ts`

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
