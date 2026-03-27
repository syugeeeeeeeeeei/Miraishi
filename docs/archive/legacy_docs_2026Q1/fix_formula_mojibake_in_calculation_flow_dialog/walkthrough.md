# 修正内容の確認

## 1. 表示フォントの変更
- 対象: `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`
- `FormulaLine` 内の `Code` に `fontFamily="body"` と `lineHeight="tall"` を追加。
- これにより、日本語と記号をアプリ既定フォントで安定表示する構成へ変更。

## 2. 計算式演算子の置換
- 同ファイル内の計算式文字列で、
  - `÷` -> `/`
  - `×` -> `*`
  に統一。
- 環境依存で表示崩れしやすい記号を回避。

## 3. 動作確認結果
- `yarn typecheck` 成功。
