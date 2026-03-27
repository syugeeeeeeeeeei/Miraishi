# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 税制スキーマに `uiMeta.items` を追加し、各項目の `name` / `description` を持てるようにした。
- 各項目を `formulaStepIds` で計算ステップと紐づけ可能にした。
- 確認画面にアコーディオンメニューを追加し、項目情報と計算式一覧を表示可能にした。

## 主な変更ファイル

- `src/types/miraishi.d.ts`
- `src/shared/taxSchemaDefaults.ts`
- `src/main/lib/validators.ts`
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`

## UIの新表示

- 「項目定義・計算式（アコーディオン）」カードを追加。
- 各項目の展開パネルで以下を確認可能。
  - name
  - description
  - 現在値
  - 関連計算式
- 「全計算式一覧」も同カード内で確認可能。

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
