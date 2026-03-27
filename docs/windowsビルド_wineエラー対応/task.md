# タスク

## 背景
`yarn deploy:win` を WSL/Linux 環境で実行すると、`electron-builder` の NSIS 生成工程で `wine is required` エラーが発生し、配布成果物の生成が中断される。

## 目的
- `yarn deploy:win` を `wine` 未導入の WSL/Linux でも失敗させない。
- `wine` が利用可能な環境では従来どおり NSIS 生成を行える選択肢を残す。

## 完了条件
1. `yarn deploy:win` が `wine` 未導入環境で完走し、Windows 向け成果物を生成できる。
2. NSIS インストーラーを明示的に生成するコマンドを別途用意する。
3. 変更内容と検証結果をドキュメント化する。
