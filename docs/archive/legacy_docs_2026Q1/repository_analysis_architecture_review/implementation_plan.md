# 実装計画（分析計画）

## 1. 対象の把握

- `README.md` / `docs/readmes/*.md` からプロダクト意図と要件を把握する。
- `package.json` / `electron-builder.yml` / `electron.vite.config.ts` から実行・配布構成を把握する。

## 2. アーキテクチャ読解

- `src/main`（計算・永続化・IPC）
- `src/preload`（ブリッジAPI）
- `src/renderer`（UI・状態管理）
- `src/types`（データモデル）

上記を横断して、入力→保存→計算→表示のフローを確認する。

## 3. 妥当性評価

- 責務分離のバランス（分離しすぎ/密結合の有無）
- データ構造とフローの適合性
- バグ発生源、性能ボトルネック、保守上のリスク

## 4. 補助検証

- `yarn typecheck`
- `yarn test`
- `yarn build`

を実行し、静的読解だけでなく実行可能性も確認する。
