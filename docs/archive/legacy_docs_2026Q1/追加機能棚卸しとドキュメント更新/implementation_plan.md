# 実装計画

1. 現行実装の確認
- `OptionMenu` と配下ダイアログ（税金ルール / 比較PDF）を確認。
- `ScenarioInputForm` の入力項目と補助表示を確認。
- `main/index.ts`, `validators.ts`, `taxSchemaEngine.ts` でIPC契約・DSL制約・履歴仕様を確認。
- `scenarioComparisonPdf.ts` でPDF構成と出力要素を確認。

2. ドキュメント更新
- `user_manual.md` を操作手順中心に刷新。
- `specification.md` を契約定義中心に刷新。
- `README.md` に最新機能の参照導線を追加。
- `glossary.md` に新用語を追加。

3. 変更確認
- 更新ファイルを再読し、実装と記述の不整合がないことを確認。
