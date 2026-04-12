# 修正内容の確認

## 変更ファイル
- `package.json`
- `scripts/deploy-win.mjs`
- `README.md`

## 変更内容

### 1. scripts をシンプル化（`package.json`）
- `typecheck` / `build` の内部呼び出しを `yarn` に統一。
- 新規追加:
  - `test:run`
  - `check`（lint + typecheck + test:run）
  - `package:unpack`
  - `package:win`
  - `release:win`
- 目的別にコマンド責務を分離:
  - 開発: `dev`
  - 検証: `check`
  - ローカル配布: `package:win`
  - 公開配布: `release:win`

### 2. `deploy-win.mjs` の安全側既定化
- `ELECTRON_BUILDER_PUBLISH` の既定値を `always` → `never` へ変更。
- `wine` なし時の案内文を `package:win` / `release:win` ベースに更新。
- lint ルールとの整合のため、`hasWine` に最小限の eslint 抑制コメントを追加。

### 3. README の手順整合
- 旧記載の `yarn build:win` / `yarn build:mac` を削除。
- 実在コマンドに置き換え:
  - `yarn check`
  - `yarn build`
  - `yarn package:win`
  - `yarn release:win`

## 検証結果
1. `yarn run`
- 新しい scripts 一覧が表示され、定義反映を確認。

2. `yarn eslint scripts/deploy-win.mjs`
- 対象ファイル単体で問題なし。

3. `yarn package:win`
- 成功。
- Linux + wine 未導入環境で zip フォールバック動作を確認。
- 生成物: `dist/miraishi-1.0.1-win.zip`

4. `yarn check`
- 失敗（既存の lint エラーが原因）。
- 代表例:
  - `src/renderer/src/components/ScenarioWorkspace/ScenarioCard.tsx` の `no-explicit-any`
  - `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx` の `no-explicit-any`
- 今回変更した `scripts/deploy-win.mjs` に起因するエラーは解消済み。
