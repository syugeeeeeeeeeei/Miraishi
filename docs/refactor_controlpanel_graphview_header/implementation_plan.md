# 実装計画

## 1. ControlPanel 分離

- `PanelHeader.tsx`: トグル + 検索UI
- `ScenarioList.tsx`: シナリオ一覧表示と選択/削除トリガー
- `DeleteScenarioDialog.tsx`: 削除確認ダイアログ
- `index.tsx`: 状態管理とイベント配線のみ

## 2. GraphView 分離

- `GraphChartPanel.tsx`: グラフ描画とローディング重ね表示
- `GraphSettingsPanel.tsx`: スライダー/表示項目設定UI
- `chartConfig.ts`: フォント定義、配色、チャートオプション生成
- `index.tsx`: 再計算・フォント準備・配線のみ

## 3. Header 分離

- `BrandTitle.tsx`: ロゴ + タイトル表示
- `OpenGraphButton.tsx`: グラフ表示ボタン
- `index.tsx`: Atom接続と配置のみ

## 4. 検証

- `yarn typecheck`
- `yarn test`
- `yarn build`
