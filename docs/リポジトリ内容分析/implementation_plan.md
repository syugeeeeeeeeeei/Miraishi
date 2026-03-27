# 実装計画（分析計画）

## 1. 目的の明確化

- 本分析の目的を「現状実装の把握」と「改善優先度の提示」に置く。
- UI の見た目ではなく、要件適合性・計算妥当性・保守性を中心に評価する。

## 2. 情報ソース収集

- プロダクト説明: `README.md`
- 契約ドキュメント: `docs/readmes/requirements_definition.md`, `specification.md`, `glossary.md`, `user_manual.md`
- 実装: `src/main`, `src/preload`, `src/renderer`, `src/types`
- 設定/運用: `package.json`, `electron.vite.config.ts`, `electron-builder.yml`, `tsconfig*`

## 3. アーキテクチャ読解

- `main`: 税制スキーマ読み込み、シナリオ永続化、予測計算、IPC ハンドラ
- `preload`: `window.api` 公開契約
- `renderer`: Jotai 状態管理、入力UI、結果テーブル、比較グラフ
- `types`: ドメインモデルとUI設定モデル

## 4. 妥当性評価

- ドキュメント要件と実装責務が対応しているかを確認する。
- 計算ロジック（残業・手当・住民税・控除）の境界条件を確認する。
- UI で編集可能な項目と型/スキーマ上の項目のギャップを確認する。
- キャッシュ戦略と再計算フローのリスクを確認する。

## 5. 実行検証

- `yarn typecheck`
- `yarn test run`
- `yarn build`

上記を実行し、静的読解だけでなく実行可能性も確認する。
