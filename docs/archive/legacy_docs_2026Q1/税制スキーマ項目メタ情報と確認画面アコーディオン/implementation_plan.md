# 実装計画

## 1. スキーマ拡張

- `TaxSchemaV2.uiMeta` に `items` マップを追加し、各項目の `name` / `description` を保持する。
- 必要に応じて `formulaStepIds` で計算式ステップと関連づける。

## 2. バリデーション対応

- `uiMeta.items` の構造を strict に検証する。
- `formulaStepIds` は既存の `FormulaStepId` カタログに束縛する。
- 既存スキーマとの互換のため `items` は未指定時に空オブジェクトを補完する。

## 3. デフォルト定義

- 主要ルール（税率、社会保険、控除）に対応する `uiMeta.items` の初期定義を追加する。

## 4. 確認画面UI

- 確認画面にアコーディオンを追加する。
- 項目ごとに以下を表示する。
  - 項目キー
  - name
  - description
  - 現在値プレビュー
  - 関連計算式
- 別セクションとして全計算式一覧を表示する。

## 5. 検証

- `yarn typecheck`
- `yarn test --run`
