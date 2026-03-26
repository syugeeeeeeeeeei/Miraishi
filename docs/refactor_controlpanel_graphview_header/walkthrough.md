# 修正内容の確認

## 変更概要

`ControlPanel`、`GraphView`、`Header` の肥大化していた単一ファイルを、責務ごとの小さなコンポーネントに分割した。

## 主要な分割先

- ControlPanel
  - `PanelHeader.tsx`
  - `ScenarioList.tsx`
  - `DeleteScenarioDialog.tsx`
- GraphView
  - `GraphChartPanel.tsx`
  - `GraphSettingsPanel.tsx`
  - `chartConfig.ts`
- Header
  - `BrandTitle.tsx`
  - `OpenGraphButton.tsx`

## 効果

- `index.tsx` が「状態管理と配線」に集中し、見通しが向上。
- UI差分の変更時に、影響範囲を局所化しやすくなった。
- 単機能コンポーネント単位でのテスト追加がしやすくなった。

## 検証結果

- `typecheck`: 成功
- `test`: 成功
- `build`: 成功
