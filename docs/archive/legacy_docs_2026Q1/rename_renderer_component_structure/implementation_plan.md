# 実装計画

## 1. 命名方針

- UIの見た目名ではなく、責務が読める名前へ揃える。
- 特に `DataView` の曖昧さを解消し、シナリオ編集体験を示す語彙に置換する。

## 2. リネーム対象

- `DataView` ディレクトリ → `ScenarioWorkspace`
- `DataViewCard` → `ScenarioCard`
- `InputView` → `ScenarioInputForm`
- `ResultView` → `ScenarioResultPanel`
- `CalculationResult` → `PredictionResultTable`
- `WelcomeScreen` → `EmptyScenarioState`

## 3. 影響範囲の反映

- `App.tsx` の import/利用コンポーネント名を更新
- 各ファイル内の import/export/props interface 名を更新

## 4. 検証

- `yarn typecheck`
- `yarn test`
- `yarn build`
