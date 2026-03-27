# 修正内容の確認

## 実施内容

1. `DataView` 一式を `ScenarioWorkspace` に移動。
2. 子コンポーネントを責務ベースへ改名。
3. `App.tsx` からの参照名を `ScenarioWorkspace` へ変更。
4. 旧命名 (`DataView*`, `InputView`, `ResultView` 等) の残存参照を除去。

## 変更後の構成

- `ScenarioWorkspace/index.tsx`
- `ScenarioWorkspace/ScenarioCard.tsx`
- `ScenarioWorkspace/ScenarioInputForm.tsx`
- `ScenarioWorkspace/ScenarioResultPanel.tsx`
- `ScenarioWorkspace/PredictionResultTable.tsx`
- `ScenarioWorkspace/EmptyScenarioState.tsx`

## 結果

- コンポーネント名から責務が読み取りやすくなった。
- ビルド/型/テストはすべて成功。
