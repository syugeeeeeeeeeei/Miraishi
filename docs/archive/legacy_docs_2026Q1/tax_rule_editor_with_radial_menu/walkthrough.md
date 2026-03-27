# 修正内容の確認

## 実装概要

税金ルールの編集をアプリ内で完結できるようにし、歯車アイコンから円形メニュー経由で設定ダイアログを開けるようにした。

## 主な変更

- Main
  - `taxSchemaSchema` バリデーションを追加し、読み込み時・更新時に検証。
  - `get-tax-schema` / `update-tax-schema` IPCを追加。
  - 税金ルール更新時に計算キャッシュをクリア。

- Preload
  - `getTaxSchema` / `updateTaxSchema` をRenderer公開APIに追加。

- Renderer（ControlPanel）
  - 歯車起点の円形メニュー `SystemRadialMenu` を追加。
  - 税金ルールダイアログ `TaxRuleDialog` を追加。
  - 税金ルール確定時にIPC更新し、計算再実行。
  - インフォ/クレジットのプレースホルダーメニューを追加（拡張性確保）。

- TaxRuleDialog
  - モーダルの誤閉じ防止（オーバーレイ/Esc閉じ無効）。
  - フォームモード: 税スキーマ全項目を編集可能。
  - JSONモード: 全文編集可、構文/形式チェックでドラフト同期。
  - フッターに「変更せず閉じる」「変更を確定」を配置。

## 検証結果

- `yarn typecheck` 成功
- `yarn test --run src/main/lib/calculator.spec.ts` 成功（8 tests passed）
