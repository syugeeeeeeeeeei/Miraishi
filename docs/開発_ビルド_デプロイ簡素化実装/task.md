# タスク

## 依頼
開発・ビルド・デプロイのフローをできるだけシンプルにするため、前回分析で優先度Aとした見直しを実装する。

## 実装対象
- `package.json` scripts の整理
- `scripts/deploy-win.mjs` の既定 publish モード見直し
- `README.md` の実行手順を実スクリプトへ整合

## 完了条件
1. scripts が Yarn 統一になっている。
2. ローカル向け Windows パッケージ作成が publish なし（安全側）で動く。
3. README のコマンド例が実在スクリプトと一致している。
