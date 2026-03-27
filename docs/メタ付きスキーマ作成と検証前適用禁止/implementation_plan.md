# 実装計画

## 1. スキーマファイル作成

- 新仕様（V2 + 文字式DSL + uiMeta.items）に適合したスキーマを用意する。
- 運用しやすいように既定ファイルと同内容のメタ付きファイルを追加する。

## 2. 適用ボタン制御

- `TaxRuleDialog` で検証レポートの有効性を判定する。
- `report.isValid && report.normalizedSchema` が揃うまで「変更を適用」を無効化する。
- 編集後は再検証を強制するため、エディタ変更時に `report` をクリアする。

## 3. 検証

- YAMLパース確認
- `yarn typecheck`
- `yarn test --run`
