# 修正内容の確認

## 1. 金額入力に単位表示を追加
- 対象: `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- `YenNumberInput` を新規追加し、入力欄右側に「円」を表示するよう変更。
- 以下の金額入力で適用:
  - 基本給（月額）
  - 年間ボーナス（総額）
  - 試用期間の基本給 / 固定残業代
  - 固定残業代制度の金額
  - 各種手当の金額

## 2. 配偶者の有無をボタン切替へ変更
- 対象: `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- 扶養・控除カード内の `Switch` を `ButtonGroup`（有 / 無）へ置換。
- 選択状態に応じて `solid` と `outline` を切り替え、状態を視覚的に判別しやすくした。

## 3. フォーム全体のサイズ調整
- 対象: `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- 入力コントロール、ラベル、見出し、追加/削除ボタンを `md` 基準で拡大。
- 画面内収まりを維持するため、カード内余白とセクション間スペースを最適化。

## 4. ワークスペース操作要素の拡大
- 対象: `src/renderer/src/components/ScenarioWorkspace/index.tsx`
- 左右ナビゲーションボタンのサイズを拡大。
- シナリオインジケータのドットサイズを拡大。

## 5. 動作確認結果
以下を実行し、すべて成功。

- `yarn typecheck`
- `yarn test`
- `yarn build`
