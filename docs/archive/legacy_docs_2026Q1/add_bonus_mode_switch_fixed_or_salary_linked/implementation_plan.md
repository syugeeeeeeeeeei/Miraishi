# 実装計画

1. 型・バリデーションの拡張
- `Scenario` に `bonus` 設定（mode, months）を追加。
- `bonus` は optional とし、既存データ互換を維持。
- Zodスキーマに `bonus` を追加。

2. 計算ロジックの拡張
- `fixed` の場合は `annualBonus` を採用。
- `basicSalaryMonths` の場合は `annualBasicSalary / 12 * months` で年間ボーナスを算出。
- 算出結果を額面年収・内訳へ反映。

3. UIの拡張
- ボーナス入力欄に「固定額 / 基本給連動」の切替を追加。
- 基本給連動モード時は「○ヶ月分」の入力UIを表示。
- 固定額モード時は円入力UIを表示。

4. 可視化ダイアログの追従
- 詳細内訳ダイアログの計算フローで、ボーナスモードに応じた式表示に切替。

5. テスト追加
- 基本給連動モードの回帰テストを追加。

6. 検証
- `yarn typecheck`
- `yarn test`
- `yarn build`
