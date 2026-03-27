# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 税制スキーマを V2 中心へ移行し、V1 は移行入口として維持。
- 税率計算を制限DSL（AST）へ寄せ、任意コード実行を排除。
- 税制ダイアログを Editor 主導に再設計し、確認画面/履歴復元を追加。
- シナリオに `taxProfile` を追加し、都道府県別健康保険率・業種別雇用保険率に対応。
- 復興特別所得税を計算・表示へ追加。

## 主な実装ファイル

- `src/types/miraishi.d.ts`
- `src/shared/taxSchemaDefaults.ts`
- `src/main/lib/taxSchemaEngine.ts`
- `src/main/lib/schemaDiff.ts`
- `src/main/lib/validators.ts`
- `src/main/lib/calculator.ts`
- `src/main/index.ts`
- `src/preload/index.ts`
- `src/renderer/src/components/ControlPanel/TaxRuleDialog.tsx`
- `src/renderer/src/components/ControlPanel/index.tsx`
- `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`

## テスト追加

- `src/main/lib/taxSchemaEngine.spec.ts`
- `src/main/lib/validators.spec.ts`
- `src/main/lib/schemaDiff.spec.ts`
- 既存 `src/main/lib/calculator.spec.ts` を V2 + compile 前提へ更新

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 18 tests）

## 補足

- `get-tax-schema` / `update-tax-schema` は互換APIとして残し、新APIへ移行しやすい構成にしている。
- スキーマ適用失敗時はクラッシュさせず、エラー応答で再編集可能な状態を維持する。
