# 実装計画

1. 原因切り分け
- 給与成長率の純粋な計算式を確認する。
- 入力値反映フロー（保存→再計算→表示）の非同期順序を確認する。

2. 反映タイミング不整合の修正
- `ScenarioCard` の保存処理を `async` 化し、`updateScenario` 完了後に `calculatePredictions` を実行する。
- これにより、古いシナリオ値での再計算を防ぐ。

3. 再計算トリガーの強化
- `ScenarioWorkspace` でシナリオ更新時刻（`updatedAt`）を監視し、内容変更時にも再計算が走るようにする。

4. 回帰テスト追加
- `calculator.spec.ts` に給与成長率100%ケースを追加し、年次で基本給が倍増することを検証する。

5. 検証
- `yarn typecheck`
- `yarn test`
- `yarn build`
